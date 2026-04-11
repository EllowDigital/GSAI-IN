import {
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const TEST_RECIPIENT = 'sarwanyadav6174@gmail.com';
const ACADEMY_LOGO_URL = 'https://ghataksportsacademy.com/assets/images/logo.webp';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-test-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type SmokeResult = {
  type: 'automated' | 'onboarding' | 'updates';
  from: string;
  ok: boolean;
  status: number;
  id?: string | null;
  error?: unknown;
};

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildSmokeTestHtml(flowName: string, expectedSender: string, timestamp: string): string {
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
    .footer { background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 32px 24px; text-align: center; color: #64748b; font-size: 13px; }
    .footer strong { color: #0f172a; font-size: 15px; display: block; margin-bottom: 8px; }
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
        <div class="academy">System Diagnostic</div>
      </div>
      <div class="body">
        <p style="font-size: 18px; font-weight: 600; color: #111827; text-align: center; margin-bottom: 24px;">Email Delivery Smoke Test</p>
        <p>This is an automated system diagnostic email to verify that the <strong>${flowName}</strong> delivery flow is functioning correctly.</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Flow Identity</span>
            <span class="info-value" style="text-transform: capitalize;">${flowName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Expected Sender</span>
            <span class="info-value">${expectedSender}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Server Timestamp</span>
            <span class="info-value">${timestamp}</span>
          </div>
        </div>
        
        <p style="margin-top: 24px; text-align: center; color: #16a34a; font-weight: 500;">✅ If you are receiving this message, the delivery configuration is successful.</p>
      </div>
      <div class="footer">
        <strong>${ACADEMY_NAME}</strong>
        <p style="margin-top:16px; font-size: 12px;">Automated internal system notification. Do not reply.</p>
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
    return json(405, { error: 'Method not allowed' });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return json(500, { error: 'Missing RESEND_API_KEY' });
  }

  const expectedTestKey = Deno.env.get('EMAIL_SMOKE_TEST_KEY')?.trim();
  if (expectedTestKey) {
    const testKey = req.headers.get('x-test-key')?.trim();
    if (!testKey || testKey !== expectedTestKey) {
      return json(401, { error: 'Invalid test key' });
    }
  }

  const now = new Date().toISOString();
  const flows: Array<{ type: SmokeResult['type']; from: string; subject: string; html: string }> = [
    {
      type: 'automated',
      from: getResendSenderAddress('automated'),
      subject: `🟢 Smoke Test: Automated Sender (${now})`,
      html: buildSmokeTestHtml('automated', 'no-reply@ghataksportsacademy.com', now),
    },
    {
      type: 'onboarding',
      from: getResendSenderAddress('onboarding'),
      subject: `🟢 Smoke Test: Onboarding Sender (${now})`,
      html: buildSmokeTestHtml('onboarding', 'admissions@ghataksportsacademy.com', now),
    },
    {
      type: 'updates',
      from: getResendSenderAddress('updates'),
      subject: `🟢 Smoke Test: Updates Sender (${now})`,
      html: buildSmokeTestHtml('updates', 'updates@ghataksportsacademy.com', now),
    },
  ];

  const results: SmokeResult[] = [];

  for (const [index, flow] of flows.entries()) {
    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${ACADEMY_NAME} <${flow.from}>`,
          to: [TEST_RECIPIENT],
          subject: flow.subject,
          html: flow.html,
        }),
      });

      const data = await response.json().catch(() => ({}));
      results.push({
        type: flow.type,
        from: flow.from,
        ok: response.ok,
        status: response.status,
        id: data?.id ?? null,
        error: response.ok ? undefined : data,
      });
    } catch (error) {
      results.push({
        type: flow.type,
        from: flow.from,
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Resend free-tier applies strict per-second limits; pace smoke-test sends.
    if (index < flows.length - 1) {
      await wait(650);
    }
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return json(502, {
      success: false,
      recipient: TEST_RECIPIENT,
      failed: failed.length,
      results,
    });
  }

  return json(200, {
    success: true,
    recipient: TEST_RECIPIENT,
    sent: results.length,
    results,
  });
});