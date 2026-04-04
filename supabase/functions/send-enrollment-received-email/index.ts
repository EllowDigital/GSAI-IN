const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const ACADEMY_NAME = 'Ghatak Sports Academy India';
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com';
const ACADEMY_PHONE = '+91 63941 35988';

interface RequestBody {
  to?: string;
  parentName?: string;
  studentName?: string;
  program?: string;
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

function buildHtml(parentName: string, studentName: string, program: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body{margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif}
    .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .header{background:#111827;color:#fff;padding:22px 28px;text-align:center}
    .body{padding:24px 28px;color:#1f2937;line-height:1.6;font-size:15px}
    .box{background:#f9fafb;border-left:4px solid #2563eb;padding:12px 14px;border-radius:0 6px 6px 0;margin:14px 0}
    .box p{margin:4px 0;font-size:14px}
    .footer{background:#f8fafc;padding:16px 28px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><strong>${ACADEMY_NAME}</strong></div>
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

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const to = (body.to || '').trim().toLowerCase();
    const parentName = (body.parentName || 'Parent').trim();
    const studentName = (body.studentName || 'Student').trim();
    const program = (body.program || 'Selected Program').trim();

    if (!isValidEmail(to)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: `${ACADEMY_NAME} <noreply@ghataksportsacademy.com>`,
        to: [to],
        subject: `Enrollment Request Received | ${ACADEMY_NAME}`,
        html: buildHtml(parentName, studentName, program),
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
