import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  ACADEMY_CONTACT_EMAIL,
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';
import {
  RequestAuthError,
  requireAdminUser,
} from '../_shared/adminAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const ACADEMY_EMAIL = ACADEMY_CONTACT_EMAIL;
const ACADEMY_PHONE = '+91 63941 35988';
const ACADEMY_LOGO_URL = 'https://ghataksportsacademy.com/assets/images/logo.webp';

interface Payload {
  type?: 'event' | 'competition';
  title?: string;
  description?: string | null;
  date?: string;
  endDate?: string | null;
  location?: string | null;
  pageUrl?: string | null;
  testRecipient?: string | null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    ? `<p style="margin-top:16px; color: #4b5563;"><strong>Details:</strong> ${escapeHtml(payload.description.toString())}</p>`
    : '';
    
  const safeUrl = payload.pageUrl && payload.pageUrl.startsWith('https://')
    ? payload.pageUrl
    : 'https://ghataksportsacademy.com/student/dashboard';

  const subject =
    kind === 'event'
      ? `Event Update: ${payload.title} | ${ACADEMY_NAME}`
      : `Competition Update: ${payload.title} | ${ACADEMY_NAME}`;

  const label = kind === 'event' ? 'Event Name' : 'Competition Name';
  const dateStr = endDate ? `${date} to ${endDate}` : date;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 30px 15px; }
    .card { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; }
    .logo { height: 56px; max-width: 220px; object-fit: contain; display: block; margin: 0 auto 12px; }
    .academy { color: #f8fafc; font-size: 16px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
    .body { padding: 40px 32px; color: #374151; line-height: 1.6; font-size: 16px; }
    .body p { margin-top: 0; margin-bottom: 16px; }
    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 0 20px; border-radius: 12px; margin: 28px 0; }
    .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px; letter-spacing: 0.5px; }
    .info-value { color: #0f172a; font-size: 16px; font-weight: 500; display: block; word-break: break-word; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    .footer { background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 32px 24px; text-align: center; color: #64748b; font-size: 13px; }
    .footer strong { color: #0f172a; font-size: 15px; display: block; margin-bottom: 8px; }
    .footer a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .contact-line { margin: 12px 0; padding: 12px 0; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; }
    @media only screen and (max-width: 480px) {
      .body { padding: 30px 20px; }
      .header { padding: 24px 16px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <img class="logo" src="${ACADEMY_LOGO_URL}" alt="${ACADEMY_NAME} logo" />
      <div class="academy">${ACADEMY_NAME}</div>
    </div>
    <div class="body">
      <p>Namaste <strong>${parentName}</strong> ji,</p>
      <p>A new ${kind} update is available for <strong>${studentName}</strong>.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${dateStr}</span>
        </div>
        ${location ? `
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value">${location}</span>
        </div>` : ''}
      </div>
      
      ${description}
      
      <div class="btn-container">
        <a class="btn" href="${safeUrl}" rel="noopener noreferrer">View Full Details</a>
      </div>
    </div>
    <div class="footer">
      <strong>${ACADEMY_NAME}</strong>
      <div class="contact-line">
        WhatsApp/Phone: ${ACADEMY_PHONE}<br/>
        Email: <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a>
      </div>
      <p style="margin-top:16px; font-size: 12px;">This is an automated message from our official academy portal. Please do not reply directly to this email.</p>
    </div>
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
    let userId = '';
    try {
      userId = await requireAdminUser(req);
    } catch (error) {
      if (error instanceof RequestAuthError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Auth verification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
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

    const uniqueRecipients = new Map<string, any>();

    const testRecipient = (payload.testRecipient || '').toString().trim().toLowerCase();
    if (testRecipient) {
      if (!isValidEmail(testRecipient)) {
        return new Response(JSON.stringify({ error: 'Invalid testRecipient email' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      uniqueRecipients.set(testRecipient, {
        student_email: testRecipient,
        parent_name: 'Parent',
        student_name: 'Student',
      });
    } else {
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

      for (const item of recipients || []) {
        const email = (item.student_email || '').toString().trim().toLowerCase();
        if (!email) continue;
        if (!uniqueRecipients.has(email)) uniqueRecipients.set(email, item);
      }
    }

    let sent = 0;
    let failed = 0;
    const totalRecipients = uniqueRecipients.size;
    const fromAddress = getResendSenderAddress('updates');

    for (const [, recipient] of uniqueRecipients) {
      const email = (recipient.student_email || '').toString().trim().toLowerCase();
      const { subject, html } = buildBody(type, recipient, payload);

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${ACADEMY_NAME} <${fromAddress}>`,
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
        triggered_by: userId,
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