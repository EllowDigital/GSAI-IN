// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type PortalScope = 'admin' | 'student';

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type RequestBody = {
  portal_scope?: PortalScope;
  subscription?: PushSubscriptionPayload;
  user_agent?: string;
  metadata?: Record<string, unknown>;
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

    const body = (await req.json()) as RequestBody;
    if (!isPortalScope(body.portal_scope)) {
      return json(400, { error: 'portal_scope must be admin or student' });
    }

    const subscription = body.subscription;
    if (!subscription || typeof subscription !== 'object') {
      return json(400, { error: 'subscription is required' });
    }

    const endpoint = (subscription.endpoint || '').trim();
    const p256dh = (subscription.keys?.p256dh || '').trim();
    const auth = (subscription.keys?.auth || '').trim();

    if (!endpoint || !p256dh || !auth) {
      return json(400, { error: 'Invalid subscription payload' });
    }

    // Enforce scope alignment to prevent cross-portal abuse.
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roleSet = new Set((roles || []).map((r: { role: string }) => r.role));
    if (body.portal_scope === 'admin' && !roleSet.has('admin')) {
      return json(403, { error: 'Admin role required for admin push scope' });
    }
    if (body.portal_scope === 'student' && !roleSet.has('student')) {
      return json(403, { error: 'Student role required for student push scope' });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userAgent = (body.user_agent || '').toString().trim().slice(0, 512) || null;

    const { error: upsertError } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          auth_user_id: user.id,
          portal_scope: body.portal_scope,
          endpoint,
          p256dh,
          auth,
          expiration_time: subscription.expirationTime,
          user_agent: userAgent,
          is_active: true,
          fail_count: 0,
          disabled_at: null,
          disable_reason: null,
          last_seen_at: new Date().toISOString(),
          metadata: body.metadata || {},
        },
        { onConflict: 'endpoint' }
      );

    if (upsertError) {
      return json(500, { error: upsertError.message });
    }

    return json(200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return json(500, { error: message });
  }
});
