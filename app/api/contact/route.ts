// POST /api/contact — sends a brief via Resend (https://resend.com).
// Env: RESEND_API_KEY, CONTACT_TO (default info@novegraphics.com), CONTACT_FROM (verified sender).

const TYPES = ['POSTER', 'ALBUM ART', 'MERCH', 'BRANDING', 'OTHER']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const escape = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(request: Request) {
  let data: { name?: unknown; email?: unknown; types?: unknown; brief?: unknown }
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 200) : ''
  const email = typeof data.email === 'string' ? data.email.trim().slice(0, 200) : ''
  const brief = typeof data.brief === 'string' ? data.brief.trim().slice(0, 5000) : ''
  const types = Array.isArray(data.types) ? data.types.filter((t): t is string => TYPES.includes(t)) : []

  if (!name) return Response.json({ error: 'Name is required.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return Response.json({ error: 'A valid email is required.' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set')
    return Response.json({ error: 'Form is not configured yet — email info@novegraphics.com.' }, { status: 500 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? 'NOVE Brief <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO ?? 'info@novegraphics.com'],
      reply_to: email,
      subject: `New brief — ${name}${types.length ? ` (${types.join(', ')})` : ''}`,
      html: `
        <p><strong>Name:</strong> ${escape(name)}</p>
        <p><strong>Email:</strong> ${escape(email)}</p>
        <p><strong>Making:</strong> ${escape(types.join(', ') || '—')}</p>
        <p><strong>Brief:</strong></p>
        <p style="white-space:pre-wrap">${escape(brief || '—')}</p>
      `,
    }),
  })

  if (!res.ok) {
    console.error('[contact] Resend error', res.status, await res.text())
    return Response.json({ error: 'Could not send right now. Try again or email info@novegraphics.com.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
