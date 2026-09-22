import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendMetaEvent } from './_lib/meta-capi.js'

interface WhatsAppClickRequest {
  leadId: string
  qualified: boolean
  eventSourceUrl: string
  fbp?: string
  fbc?: string
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key) out[key] = decodeURIComponent(rest.join('='))
  }
  return out
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const body = req.body as WhatsAppClickRequest
  if (!body?.leadId) {
    res.status(400).json({ error: 'missing_lead_id' })
    return
  }

  // Mesma regra do envio do formulário: só lead qualificado gera evento pro Meta.
  if (body.qualified) {
    const cookies = parseCookies(req.headers.cookie)

    await sendMetaEvent({
      eventName: 'WhatsAppClick',
      eventId: `${body.leadId}_whatsapp`,
      eventSourceUrl: body.eventSourceUrl || req.headers.referer || '',
      userData: {
        clientIpAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim(),
        clientUserAgent: req.headers['user-agent'],
        fbp: body.fbp ?? cookies['_fbp'],
        fbc: body.fbc ?? cookies['_fbc'],
        externalId: body.leadId,
      },
      customData: { lead_id: body.leadId },
    })
  }

  res.status(200).json({ ok: true })
}
