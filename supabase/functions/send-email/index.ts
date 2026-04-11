import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  ACADEMY_CONTACT_EMAIL,
  ACADEMY_NAME,
  getResendSenderAddress,
} from '../_shared/emailConfig.ts';

function normalizeOrigin(origin: string): string | null {
  const trimmed = origin.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    return `${parsed.protocol}//${parsed.host}`.toLowerCase()
  } catch {
    return null
  }
}

const ALLOWED_ORIGINS = new Set(
  (Deno.env.get('ALLOWED_EMAIL_ORIGINS') ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin))
)

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const ACADEMY_EMAIL = ACADEMY_CONTACT_EMAIL
const ACADEMY_PHONE = '+91 63941 35988'
const ACADEMY_LOGO_URL = 'https://ghataksportsacademy.com/assets/images/logo.webp'
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

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) return false

  // Fail open if no allowlist is configured so production does not break.
  if (ALLOWED_ORIGINS.size === 0) return true

  if (ALLOWED_ORIGINS.has(normalizedOrigin)) return true

  const url = new URL(normalizedOrigin)
  if (url.hostname.startsWith('www.')) {
    const withoutWww = `${url.protocol}//${url.host.replace(/^www\./, '')}`
    return ALLOWED_ORIGINS.has(withoutWww)
  }

  const withWww = `${url.protocol}//www.${url.host}`
  return ALLOWED_ORIGINS.has(withWww)
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

// Keep delivery single-attempt by default to avoid duplicate sends without provider idempotency.
async function sendWithRetry(url: string, init: RequestInit, maxAttempts = 1) {
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

    if (attempt < maxAttempts) {
      await wait(250 * attempt)
    }
  }

  if (lastResponse) return lastResponse
  throw lastError ?? new Error('Unknown email delivery error')
}

function buildHtmlEmail(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937}
  .wrapper{max-width:640px;margin:0 auto;padding:24px 14px}
  .card{background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.06)}
  .header{background:#0f172a;padding:20px 26px;text-align:center}
  .logo{height:46px;max-width:220px;object-fit:contain;display:block;margin:0 auto 8px}
  .academy{color:#e2e8f0;font-size:14px;font-weight:600;letter-spacing:.2px}
  .body{padding:26px;color:#1f2937;line-height:1.65;font-size:15px}
  .body h2{margin:0 0 14px;color:#0f172a;font-size:19px}
  .footer{background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 26px;text-align:center;color:#64748b;font-size:12px}
  .footer a{color:#1d4ed8;text-decoration:none}
</style></head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <img class="logo" src="${ACADEMY_LOGO_URL}" alt="${ACADEMY_NAME} logo" />
      <div class="academy">${ACADEMY_NAME}</div>
    </div>
    <div class="body">
      <h2>${subject}</h2>
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>${ACADEMY_NAME}</p>
      <p>Phone / WhatsApp: ${ACADEMY_PHONE} | Email: <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a></p>
      <p style="margin-top:8px">This is an automated email from the academy portal.</p>
    </div>
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
    const fromAddress = getResendSenderAddress('automated')

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
        from: `${ACADEMY_NAME} <${fromAddress}>`,
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
