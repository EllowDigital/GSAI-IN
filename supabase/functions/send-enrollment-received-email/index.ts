import {
  ACADEMY_CONTACT_EMAIL,
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const ACADEMY_EMAIL = ACADEMY_CONTACT_EMAIL;
const ACADEMY_PHONE = '+91 63941 35988';
const ACADEMY_LOGO_URL = 'https://ghataksportsacademy.com/assets/images/logo.webp';
const ADMIN_PORTAL_URL = 'https://ghataksportsacademy.com/admin';

interface RequestBody {
  to?: string;
  cc?: string;
  parentName?: string;
  parentEmail?: string;
  studentName?: string;
  program?: string;
  parentPhone?: string;
  studentEmail?: string;
  studentPhone?: string;
  notificationType?: 'parent' | 'admin';
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

function buildParentHtml(parentName: string, studentName: string, program: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body{margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937}
    .wrapper{max-width:640px;margin:0 auto;padding:24px 14px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.06)}
    .header{background:#0f172a;padding:20px 26px;text-align:center}
    .logo{height:46px;max-width:220px;object-fit:contain;display:block;margin:0 auto 8px}
    .academy{color:#e2e8f0;font-size:14px;font-weight:600;letter-spacing:.2px}
    .body{padding:26px;color:#1f2937;line-height:1.65;font-size:15px}
    .box{background:#f8fafc;border:1px solid #dbeafe;border-left:4px solid #2563eb;padding:12px 14px;border-radius:10px;margin:14px 0}
    .box p{margin:4px 0;font-size:14px}
    .footer{background:#f8fafc;padding:16px 26px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e5e7eb}
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
        <p>Namaste <strong>${escapeHtml(parentName)}</strong> ji,</p>
        <p>We have successfully received the enrollment request for <strong>${escapeHtml(studentName)}</strong> in <strong>${escapeHtml(program)}</strong>.</p>
        <div class="box">
          <p><strong>Status:</strong> Request Received</p>
          <p><strong>Next Step:</strong> Our team will contact you within 24 hours.</p>
        </div>
        <p>Thank you for choosing ${ACADEMY_NAME}.</p>
      </div>
      <div class="footer">
        <p>Phone / WhatsApp: ${ACADEMY_PHONE}</p>
        <p>Email: ${ACADEMY_EMAIL}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
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
  <style>
    body{margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937}
    .wrapper{max-width:640px;margin:0 auto;padding:24px 14px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.06)}
    .header{background:#0f172a;padding:20px 26px;text-align:center}
    .logo{height:46px;max-width:220px;object-fit:contain;display:block;margin:0 auto 8px}
    .academy{color:#e2e8f0;font-size:14px;font-weight:600;letter-spacing:.2px}
    .body{padding:26px;color:#1f2937;line-height:1.65;font-size:15px}
    .box{background:#f8fafc;border:1px solid #dbeafe;border-left:4px solid #2563eb;padding:12px 14px;border-radius:10px;margin:14px 0}
    .box p{margin:4px 0;font-size:14px}
    .footer{background:#f8fafc;padding:16px 26px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e5e7eb}
    .btn{display:inline-block;background:#1d4ed8;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:10px}
    a.btn,a.btn:visited,a.btn:hover,a.btn:active{color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;text-decoration:none}
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
        <p>A new enrollment form has been submitted from the public website.</p>
        <div class="box">
          <p><strong>Student:</strong> ${escapeHtml(details.studentName)}</p>
          <p><strong>Program:</strong> ${escapeHtml(details.program)}</p>
          <p><strong>Parent:</strong> ${escapeHtml(details.parentName)}</p>
          <p><strong>Parent Email:</strong> ${escapeHtml(details.parentEmail)}</p>
          <p><strong>Parent Phone:</strong> ${escapeHtml(details.parentPhone)}</p>
          <p><strong>Student Email:</strong> ${escapeHtml(details.studentEmail)}</p>
          <p><strong>Student Phone:</strong> ${escapeHtml(details.studentPhone)}</p>
        </div>
        <p>Please review this request in the admin portal and decide the next stage (contact / approve / reject).</p>
        <p><a class="btn" href="${ADMIN_PORTAL_URL}" rel="noopener noreferrer" style="display:inline-block;background:#1d4ed8;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;">Open Admin Portal</a></p>
      </div>
      <div class="footer">
        <p>Phone / WhatsApp: ${ACADEMY_PHONE}</p>
        <p>Email: ${ACADEMY_EMAIL}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
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

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const to = (body.to || '').trim().toLowerCase();
    const cc = (body.cc || '').trim().toLowerCase();
    const parentName = (body.parentName || 'Parent').trim();
    const parentEmail = (body.parentEmail || 'Not provided').trim();
    const studentName = (body.studentName || 'Student').trim();
    const program = (body.program || 'Selected Program').trim();
    const parentPhone = (body.parentPhone || 'Not provided').trim();
    const studentEmail = (body.studentEmail || 'Not provided').trim();
    const studentPhone = (body.studentPhone || 'Not provided').trim();
    const notificationType = body.notificationType === 'admin' ? 'admin' : 'parent';

    if (!isValidEmail(to)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (cc && !isValidEmail(cc)) {
      return new Response(JSON.stringify({ error: 'Invalid cc email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject =
      notificationType === 'admin'
        ? `New Enrollment Submission | ${ACADEMY_NAME}`
        : `Enrollment Request Received | ${ACADEMY_NAME}`;
    const fromAddress = getResendSenderAddress('onboarding');

    const html =
      notificationType === 'admin'
        ? buildAdminHtml({
            studentName,
            parentName,
            parentEmail,
            program,
            parentPhone,
            studentEmail,
            studentPhone,
          })
        : buildParentHtml(parentName, studentName, program);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${ACADEMY_NAME} <${fromAddress}>`,
        to: [to],
        ...(cc ? { cc: [cc] } : {}),
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
