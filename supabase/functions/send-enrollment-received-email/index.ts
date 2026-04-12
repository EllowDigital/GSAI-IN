import {
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const ADMIN_EMAIL = Deno.env.get('ACADEMY_CONTACT_EMAIL')?.trim() || '';
const ADMIN_CC = Deno.env.get('ADMIN_CC_EMAIL')?.trim() || '';
const ACADEMY_LOGO_URL = 'https://ghataksportsacademy.com/assets/images/logo.webp';
const ADMIN_PORTAL_URL = 'https://ghataksportsacademy.com/admin';
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const requestBuckets = new Map<string, number[]>();

interface RequestBody {
  parentName?: string;
  parentEmail?: string;
  studentName?: string;
  program?: string;
  parentPhone?: string;
  studentEmail?: string;
  studentPhone?: string;
  notificationType?: 'admin';
}

function normalizeOrigin(origin: string): string | null {
  const trimmed = origin.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = new Set(
  (Deno.env.get('ALLOWED_EMAIL_ORIGINS') ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin))
);

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return ALLOWED_ORIGINS.size === 0;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  if (ALLOWED_ORIGINS.size === 0) return true;
  if (ALLOWED_ORIGINS.has(normalizedOrigin)) return true;

  const url = new URL(normalizedOrigin);
  if (url.hostname.startsWith('www.')) {
    const withoutWww = `${url.protocol}//${url.host.replace(/^www\./, '')}`;
    return ALLOWED_ORIGINS.has(withoutWww);
  }

  const withWww = `${url.protocol}//www.${url.host}`;
  return ALLOWED_ORIGINS.has(withWww);
}

function getClientAddress(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || req.headers.get('X-Forwarded-For') || '';
  const firstXff = xff.split(',')[0]?.trim();
  if (firstXff) return firstXff;
  return req.headers.get('x-real-ip') || req.headers.get('X-Real-IP') || 'unknown';
}

function enforceRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const requests = (requestBuckets.get(key) ?? []).filter((stamp) => stamp >= windowStart);

  if (requests.length >= MAX_REQUESTS_PER_WINDOW) {
    requestBuckets.set(key, requests);
    return false;
  }

  requests.push(now);
  requestBuckets.set(key, requests);
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildAdminHtml(details: {
  studentName: string;
  parentName: string;
  parentEmail: string;
  program: string;
  parentPhone: string;
  studentEmail: string;
  studentPhone: string;
}): string {
  return `<!DOCTYPE html>
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
        <div class="academy">Admin Notification</div>
      </div>
      <div class="body">
        <p style="font-size: 18px; font-weight: 600; color: #111827; text-align: center; margin-bottom: 24px;">New Enrollment Submission</p>
        <p>A new enrollment form has been submitted from the public website. Here are the details:</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Student Name</span>
            <span class="info-value">${escapeHtml(details.studentName)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Program Selected</span>
            <span class="info-value">${escapeHtml(details.program)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Parent Name</span>
            <span class="info-value">${escapeHtml(details.parentName)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Parent Phone</span>
            <span class="info-value">${escapeHtml(details.parentPhone)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Parent Email</span>
            <span class="info-value"><a href="mailto:${escapeHtml(details.parentEmail)}">${escapeHtml(details.parentEmail)}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Student Phone</span>
            <span class="info-value">${escapeHtml(details.studentPhone)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Student Email</span>
            <span class="info-value"><a href="mailto:${escapeHtml(details.studentEmail)}">${escapeHtml(details.studentEmail)}</a></span>
          </div>
        </div>
        
        <p style="margin-top: 24px;">Please review this request in the admin portal and update the stage to "contacted", "approved", or "rejected".</p>
        
        <div class="btn-container">
          <a class="btn" href="${ADMIN_PORTAL_URL}" rel="noopener noreferrer" style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;">Open Admin Portal</a>
        </div>
      </div>
      <div class="footer">
        <strong>${ACADEMY_NAME}</strong>
        <p style="margin-top:16px; font-size: 12px;">Automated internal notification system.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY || !ADMIN_EMAIL || !ADMIN_CC) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const requesterKey = getClientAddress(req) || 'unknown-client';
  if (!enforceRateLimit(requesterKey)) {
    return new Response(JSON.stringify({ error: 'Rate limited' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const parentName = (body.parentName || 'Parent').trim();
    const parentEmail = (body.parentEmail || 'Not provided').trim();
    const studentName = (body.studentName || 'Student').trim();
    const program = (body.program || 'Selected Program').trim();
    const parentPhone = (body.parentPhone || 'Not provided').trim();
    const studentEmail = (body.studentEmail || 'Not provided').trim();
    const studentPhone = (body.studentPhone || 'Not provided').trim();
    const notificationType = body.notificationType === 'admin' ? 'admin' : null;

    if (!notificationType) {
      return new Response(
        JSON.stringify({ error: 'Only admin notification is supported' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resolvedTo = ADMIN_EMAIL.toLowerCase();
    const resolvedCc = ADMIN_CC.toLowerCase();

    if (!isValidEmail(resolvedTo)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (resolvedCc && !isValidEmail(resolvedCc)) {
      return new Response(JSON.stringify({ error: 'Invalid cc email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = `New Enrollment Submission | ${ACADEMY_NAME}`;
    const fromAddress = getResendSenderAddress('onboarding');

    const html = buildAdminHtml({
      studentName,
      parentName,
      parentEmail,
      program,
      parentPhone,
      studentEmail,
      studentPhone,
    });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${ACADEMY_NAME} <${fromAddress}>`,
        to: [resolvedTo],
        ...(resolvedCc ? { cc: [resolvedCc] } : {}),
        subject,
        html,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Email delivery failed', details: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id || null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});