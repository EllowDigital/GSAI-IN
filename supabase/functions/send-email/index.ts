const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const ACADEMY_NAME = 'Ghatak Sports Academy India'
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com'
const ACADEMY_PHONE = '+91 63941 35988'

interface EmailRequest {
  to: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json() as EmailRequest
    
    if (!body.to || !body.subject) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const htmlContent = body.html || buildHtmlEmail(body.subject, `<p>${(body.text || '').replace(/\n/g, '<br>')}</p>`)

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: `${ACADEMY_NAME} <noreply@ghataksportsacademy.com>`,
        to: [body.to],
        subject: body.subject,
        html: htmlContent,
        ...(body.replyTo ? { reply_to: body.replyTo } : {}),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: `Resend API failed [${response.status}]`, details: data }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: unknown) {
    console.error('Email send error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
