import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { ACADEMY_CONTACT_EMAIL } from '../_shared/emailConfig.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type PortalScope = 'admin' | 'student';

type SendPushBody = {
  title?: string;
  message?: string;
  portal_scope?: PortalScope;
  auth_user_id?: string;
  url?: string;
  data?: Record<string, unknown>;
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isPortalScope(value: unknown): value is PortalScope {
  return value === 'admin' || value === 'student';
}

function chunk<T>(input: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < input.length; index += size) {
    out.push(input.slice(index, index + size));
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json(401, { error: 'Unauthorized' });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return json(401, { error: 'Unauthorized' });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return json(403, { error: 'Admin access required' });
    }

    const body = (await req.json()) as SendPushBody;
    const title = (body.title || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const targetUrl = (body.url || '').toString().trim();

    if (!title || !message) {
      return json(400, { error: 'title and message are required' });
    }

    if (title.length > 120 || message.length > 300) {
      return json(400, { error: 'title/message too long for push payload' });
    }

    if (body.portal_scope && !isPortalScope(body.portal_scope)) {
      return json(400, { error: 'portal_scope must be admin or student' });
    }

    const vapidPublicKey = Deno.env.get('WEB_PUSH_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('WEB_PUSH_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('WEB_PUSH_SUBJECT') || `mailto:${ACADEMY_CONTACT_EMAIL}`;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return json(500, {
        error: 'Missing WEB_PUSH_PUBLIC_KEY or WEB_PUSH_PRIVATE_KEY environment variables',
      });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabaseAdmin
      .from('push_subscriptions')
      .select('id, auth_user_id, portal_scope, endpoint, p256dh, auth')
      .eq('is_active', true)
      .order('last_seen_at', { ascending: false })
      .limit(200);

    if (body.portal_scope) {
      query = query.eq('portal_scope', body.portal_scope);
    }
    if (body.auth_user_id) {
      query = query.eq('auth_user_id', body.auth_user_id);
    }

    const { data: subscriptions, error: subsError } = await query;
    if (subsError) {
      return json(500, { error: subsError.message });
    }

    const targets = subscriptions || [];
    if (targets.length === 0) {
      return json(200, {
        success: true,
        total: 0,
        sent: 0,
        failed: 0,
        message: 'No active subscriptions matched this target.',
      });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: targetUrl || '/student/dashboard',
      icon: '/icons/android-chrome-192x192.png',
      badge: '/icons/favicon-32x32.png',
      data: body.data || {},
      sent_at: new Date().toISOString(),
    });

    let sent = 0;
    let failed = 0;
    const deactivateIds: string[] = [];
    const failedIds: string[] = [];

    // Keep concurrency low to stay reliable on free-tier function compute limits.
    const chunks = chunk(targets, 10);
    for (const part of chunks) {
      const results = await Promise.all(
        part.map(async (entry) => {
          const subscription = {
            endpoint: entry.endpoint,
            keys: { p256dh: entry.p256dh, auth: entry.auth },
          };

          try {
            await webpush.sendNotification(subscription, payload, { TTL: 60 * 60 * 6 });
            return { ok: true, id: entry.id };
          } catch (error: unknown) {
            const statusCode =
              typeof error === 'object' && error !== null && 'statusCode' in error
                ? Number((error as { statusCode?: number }).statusCode)
                : undefined;

            if (statusCode === 404 || statusCode === 410) {
              deactivateIds.push(entry.id);
            } else {
              failedIds.push(entry.id);
            }

            return { ok: false, id: entry.id };
          }
        })
      );

      for (const result of results) {
        if (result.ok) {
          sent += 1;
        } else {
          failed += 1;
        }
      }
    }

    if (deactivateIds.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .update({
          is_active: false,
          disable_reason: 'expired_or_gone',
          disabled_at: new Date().toISOString(),
        })
        .in('id', deactivateIds);
    }

    if (failedIds.length > 0) {
      await supabaseAdmin.rpc('increment_push_failures', {
        p_subscription_ids: failedIds,
      });
    }

    await supabaseAdmin.from('push_notification_delivery_logs').insert({
      portal_scope: body.portal_scope || null,
      triggered_by: user.id,
      target_user_id: body.auth_user_id || null,
      total_targets: targets.length,
      sent_count: sent,
      failed_count: failed,
      title,
      body: message,
      target_url: targetUrl || null,
      metadata: {
        has_custom_data: Boolean(body.data),
      },
    });

    return json(200, {
      success: true,
      total: targets.length,
      sent,
      failed,
      deactivated: deactivateIds.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return json(500, { error: message });
  }
});
