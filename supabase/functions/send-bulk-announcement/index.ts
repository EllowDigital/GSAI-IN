import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const ACADEMY_NAME = 'Ghatak Sports Academy India';

interface Payload {
  type?: 'event' | 'competition';
  title?: string;
  description?: string | null;
  date?: string;
  endDate?: string | null;
  location?: string | null;
  pageUrl?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildBody(kind: 'event' | 'competition', recipient: any, payload: Payload): { subject: string; html: string } {
  const parentName = escapeHtml((recipient.parent_name || 'Parent').toString());
  const studentName = escapeHtml((recipient.student_name || 'Student').toString());
  const title = escapeHtml((payload.title || '').toString());
  const date = escapeHtml((payload.date || '').toString());
  const endDate = payload.endDate ? escapeHtml(payload.endDate.toString()) : '';
  const location = payload.location ? escapeHtml(payload.location.toString()) : '';
  const description = payload.description
    ? `<p><strong>Details:</strong> ${escapeHtml(payload.description.toString())}</p>`
    : '';
  const safeUrl = payload.pageUrl && payload.pageUrl.startsWith('https://')
    ? payload.pageUrl
    : 'https://ghataksportsacademy.com/student/dashboard';

  const subject =
    kind === 'event'
      ? `Event Update: ${payload.title} | ${ACADEMY_NAME}`
      : `Competition Update: ${payload.title} | ${ACADEMY_NAME}`;

  const label = kind === 'event' ? 'Event' : 'Competition';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  body{margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .header{background:#111827;color:#fff;padding:22px 28px;text-align:center}
  .body{padding:24px 28px;color:#1f2937;line-height:1.6;font-size:15px}
  .box{background:#f9fafb;border-left:4px solid #2563eb;padding:12px 14px;border-radius:0 6px 6px 0;margin:14px 0}
  .box p{margin:4px 0;font-size:14px}
  .btn{display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><strong>${ACADEMY_NAME}</strong></div>
  <div class="body">
    <p>Namaste <strong>${parentName}</strong> ji,</p>
    <p>New ${label.toLowerCase()} update for <strong>${studentName}</strong>.</p>
    <div class="box">
      <p><strong>${label}:</strong> ${title}</p>
      <p><strong>Date:</strong> ${date}${endDate ? ` to ${endDate}` : ''}</p>
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
    </div>
    ${description}
    <p><a class="btn" href="${safeUrl}" rel="noopener noreferrer">View Update</a></p>
  </div>
</div>
</body>
</html>`;

  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userErr,
    } = await supabaseClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as Payload;
    const type = payload.type;
    if (type !== 'event' && type !== 'competition') {
      return new Response(JSON.stringify({ error: 'Invalid announcement type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_email, parent_name, student_name')
      .eq('status', 'approved')
      .not('student_email', 'is', null);

    if (recipientsError) {
      return new Response(JSON.stringify({ error: recipientsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uniqueRecipients = new Map<string, any>();
    for (const item of recipients || []) {
      const email = (item.student_email || '').toString().trim().toLowerCase();
      if (!email) continue;
      if (!uniqueRecipients.has(email)) uniqueRecipients.set(email, item);
    }

    let sent = 0;
    let failed = 0;
    const totalRecipients = uniqueRecipients.size;

    for (const [, recipient] of uniqueRecipients) {
      const email = (recipient.student_email || '').toString().trim().toLowerCase();
      const { subject, html } = buildBody(type, recipient, payload);

      const response = await fetch(`${GATEWAY_URL}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: `${ACADEMY_NAME} <noreply@ghataksportsacademy.com>`,
          to: [email],
          subject,
          html,
        }),
      });

      if (response.ok) {
        sent += 1;
      } else {
        failed += 1;
      }
    }

    const { error: logError } = await supabaseAdmin
      .from('announcement_delivery_logs')
      .insert({
        announcement_type: type,
        announcement_title: (payload.title || '').toString(),
        total_recipients: totalRecipients,
        sent_count: sent,
        failed_count: failed,
        triggered_by: user.id,
        metadata: {
          date: payload.date || null,
          endDate: payload.endDate || null,
          location: payload.location || null,
          pageUrl: payload.pageUrl || null,
        },
      });

    if (logError) {
      console.error('announcement_delivery_logs insert failed', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: totalRecipients,
        sent,
        failed,
        log_saved: !logError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
