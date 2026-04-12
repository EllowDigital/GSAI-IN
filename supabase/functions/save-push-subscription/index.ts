import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  RequestAuthError,
  getUserRoles,
  requireAuthenticatedUser,
} from '../_shared/adminAuth.ts';

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
    let userId = '';
    try {
      userId = await requireAuthenticatedUser(req);
    } catch (error) {
      if (error instanceof RequestAuthError) {
        return json(error.status, { error: error.message });
      }
      return json(500, { error: 'Auth verification failed' });
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
    const roleSet = await getUserRoles(userId);
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

    const subscriptionRecord = {
      auth_user_id: userId,
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
    };

    const { error: insertError } = await supabaseAdmin
      .from('push_subscriptions')
      .insert(subscriptionRecord);

    if (insertError && insertError.code !== '23505') {
      return json(500, { error: insertError.message });
    }

    if (insertError?.code === '23505') {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('push_subscriptions')
        .select('auth_user_id')
        .eq('endpoint', endpoint)
        .maybeSingle();

      if (existingError) {
        return json(500, { error: existingError.message });
      }

      if (!existing) {
        return json(500, { error: 'Unable to verify subscription ownership' });
      }

      if (existing.auth_user_id !== userId) {
        return json(409, {
          error: 'Subscription endpoint already belongs to another user',
        });
      }

      const { error: updateError } = await supabaseAdmin
        .from('push_subscriptions')
        .update(subscriptionRecord)
        .eq('endpoint', endpoint)
        .eq('auth_user_id', userId);

      if (updateError) {
        return json(500, { error: updateError.message });
      }
    }

    return json(200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return json(500, { error: message });
  }
});
