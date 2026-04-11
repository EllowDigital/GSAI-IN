import {
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const TEST_RECIPIENT = 'sarwanyadav6174@gmail.com';

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
      subject: `Smoke Test: Automated Sender (${now})`,
      html: `<p>This is a smoke test email for <strong>automated</strong> flow.</p><p>Expected sender: no-reply@ghataksportsacademy.com</p><p>Timestamp: ${now}</p>`,
    },
    {
      type: 'onboarding',
      from: getResendSenderAddress('onboarding'),
      subject: `Smoke Test: Onboarding Sender (${now})`,
      html: `<p>This is a smoke test email for <strong>onboarding</strong> flow.</p><p>Expected sender: admissions@ghataksportsacademy.com</p><p>Timestamp: ${now}</p>`,
    },
    {
      type: 'updates',
      from: getResendSenderAddress('updates'),
      subject: `Smoke Test: Updates Sender (${now})`,
      html: `<p>This is a smoke test email for <strong>updates</strong> flow.</p><p>Expected sender: updates@ghataksportsacademy.com</p><p>Timestamp: ${now}</p>`,
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
