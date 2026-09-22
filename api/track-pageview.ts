import type { VercelRequest, VercelResponse } from '@vercel/node'
import { recordEvent } from './_lib/db.js'

interface TrackPageViewRequest {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const body = req.body as TrackPageViewRequest

  await recordEvent({
    type: 'page_view',
    utmSource: body?.utm_source,
    utmMedium: body?.utm_medium,
    utmCampaign: body?.utm_campaign,
    utmContent: body?.utm_content,
    utmTerm: body?.utm_term,
    fbclid: body?.fbclid,
  })

  res.status(200).json({ ok: true })
}
