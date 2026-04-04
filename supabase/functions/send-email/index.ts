import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = new Set(
  (Deno.env.get('ALLOWED_EMAIL_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const ACADEMY_NAME = 'Ghatak Sports Academy India'
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com'
const ACADEMY_PHONE = '+91 63941 35988'
const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 20

const requestBuckets = new Map<string, number[]>()

interface EmailRequest {
  to: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true
  if (ALLOWED_ORIGINS.size === 0) return false
  return ALLOWED_ORIGINS.has(origin)
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }

  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin ?? '*'
  }

  return headers
}

function jsonResponse(status: number, payload: unknown, origin: string | null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  })
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  origin: string | null,
  details?: unknown
) {
  const payload: ApiErrorResponse = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  }
  return jsonResponse(status, payload, origin)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function enforceRateLimit(key: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const requests = (requestBuckets.get(key) ?? []).filter((stamp) => stamp >= windowStart)

  if (requests.length >= MAX_REQUESTS_PER_WINDOW) {
    requestBuckets.set(key, requests)
    return false
  }

  requests.push(now)
  requestBuckets.set(key, requests)
  return true
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendWithRetry(url: string, init: RequestInit, maxAttempts = 3) {
  let lastResponse: Response | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, init)
      lastResponse = response

      if (response.ok || response.status < 500 || attempt === maxAttempts) {
        return response
      }
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts) throw error
    }

    await wait(250 * attempt)
  }

  if (lastResponse) return lastResponse
  throw lastError ?? new Error('Unknown email delivery error')
}

function buildHtmlEmail(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif}
  .wrapper{max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
  .header{background:#1a1a2e;color:#fff;padding:24px 32px;text-align:center}
  .header h1{margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px}
  .body{padding:28px 32px;color:#333;line-height:1.7;font-size:15px}
  .body h2{color:#1a1a2e;font-size:18px;margin:0 0 16px}
  .info-box{background:#f0f4ff;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:0 6px 6px 0;margin:16px 0}
  .info-box p{margin:4px 0;font-size:14px}
  .footer{background:#f8f9fa;padding:20px 32px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee}
  .footer a{color:#3b82f6;text-decoration:none}
  .btn{display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin:12px 0}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>🥋 ${ACADEMY_NAME}</h1></div>
  <div class="body">
    <h2>${subject}</h2>
    ${bodyHtml}
  </div>
  <div class="footer">
    <p>${ACADEMY_NAME}</p>
    <p>📞 ${ACADEMY_PHONE} | ✉️ <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a></p>
    <p style="margin-top:8px;font-size:11px;color:#aaa">This is an automated notification. Please do not reply directly.</p>
  </div>
</div>
</body></html>`
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return errorResponse(403, 'forbidden_origin', 'Origin is not allowed', origin)
    }
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Only POST is allowed', origin)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(401, 'unauthorized', 'Missing or invalid authorization header', origin)
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: authData, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !authData.user) {
    return errorResponse(401, 'unauthorized', 'Invalid or expired token', origin)
  }

  const userId = authData.user.id
  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()

  if (roleError || !roleData) {
    return errorResponse(403, 'forbidden', 'Admin access required', origin)
  }

  if (!isOriginAllowed(origin)) {
    return errorResponse(403, 'forbidden_origin', 'Origin is not allowed', origin)
  }

  if (!enforceRateLimit(userId)) {
    return errorResponse(429, 'rate_limited', 'Too many email requests. Please retry later.', origin)
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) {
    return errorResponse(500, 'server_misconfigured', 'LOVABLE_API_KEY not configured', origin)
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return errorResponse(500, 'server_misconfigured', 'RESEND_API_KEY not configured', origin)
  }

  try {
    const body = await req.json() as EmailRequest

    const to = (body.to ?? '').trim()
    const subject = sanitizeHeaderValue((body.subject ?? '').trim())
    if (!to || !subject) {
      return errorResponse(400, 'invalid_payload', 'Missing required fields: to, subject', origin)
    }

    if (!isValidEmail(to)) {
      return errorResponse(400, 'invalid_email', 'Recipient email is invalid', origin)
    }

    const replyTo = body.replyTo?.trim()
    if (replyTo && !isValidEmail(replyTo)) {
      return errorResponse(400, 'invalid_reply_to', 'replyTo email is invalid', origin)
    }

    const text = typeof body.text === 'string' ? body.text : ''

    const htmlContent = body.html && body.html.trim().length > 0
      ? body.html
      : buildHtmlEmail(subject, `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`)

    const response = await sendWithRetry(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: `${ACADEMY_NAME} <noreply@ghataksportsacademy.com>`,
        to: [to],
        subject,
        html: htmlContent,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('Resend API error', {
        status: response.status,
        userId,
        details: data,
      })
      return errorResponse(
        response.status,
        'email_delivery_failed',
        `Resend API failed [${response.status}]`,
        origin,
        data
      )
    }

    return jsonResponse(200, { success: true, data: { id: data.id } }, origin)
  } catch (error: unknown) {
    console.error('Email send error', {
      error,
      origin,
    })
    const message = error instanceof Error ? error.message : 'Unknown error'
    return errorResponse(500, 'internal_error', message, origin)
  }
})
