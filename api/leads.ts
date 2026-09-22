import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { questions } from '../src/data/questions.js'
import { computeResult } from '../src/lib/scoring.js'
import type { Option } from '../src/data/questions.js'
import type { SubmitLeadRequest, SubmitLeadResponse } from '../src/lib/leadPayload.js'
import { sendMetaEvent } from './_lib/meta-capi.js'
import { recordEvent } from './_lib/db.js'

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key) out[key] = decodeURIComponent(rest.join('='))
  }
  return out
}

// Nunca confia na pontuação vinda do cliente — resolve cada resposta contra
// os dados canônicos do formulário no servidor.
function resolveAnswers(answers: SubmitLeadRequest['answers']): Option[] | null {
  const resolved: Option[] = []

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id)
    if (!answer) return null

    const option = question.options.find((o) => o.id === answer.optionId)
    if (!option) return null

    resolved.push(option)
  }

  return resolved
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const body = req.body as SubmitLeadRequest
  const resolvedOptions = resolveAnswers(body?.answers ?? [])

  if (!resolvedOptions) {
    res.status(400).json({ error: 'invalid_answers' })
    return
  }

  const leadId = randomUUID()
  const { score, tier } = computeResult(resolvedOptions)

  const cookies = parseCookies(req.headers.cookie)
  const userData = {
    clientIpAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim(),
    clientUserAgent: req.headers['user-agent'],
    fbp: body.attribution?.fbp ?? cookies['_fbp'],
    fbc: body.attribution?.fbc ?? cookies['_fbc'],
    externalId: leadId,
  }

  const eventSourceUrl = body.eventSourceUrl || req.headers.referer || ''
  const customData = {
    lead_id: leadId,
    score,
    utm_source: body.attribution?.utm_source,
    utm_medium: body.attribution?.utm_medium,
    utm_campaign: body.attribution?.utm_campaign,
    utm_content: body.attribution?.utm_content,
    utm_term: body.attribution?.utm_term,
    fbclid: body.attribution?.fbclid,
  }

  // Sempre grava no banco (dashboard interno) — independente da regra abaixo,
  // que só manda sinal positivo pro Meta.
  await recordEvent({
    type: 'form_submitted',
    leadId,
    tier,
    score,
    utmSource: body.attribution?.utm_source,
    utmMedium: body.attribution?.utm_medium,
    utmCampaign: body.attribution?.utm_campaign,
    utmContent: body.attribution?.utm_content,
    utmTerm: body.attribution?.utm_term,
    fbclid: body.attribution?.fbclid,
  })

  // Só lead qualificado gera sinal pro Meta — desqualificado não dispara
  // nenhum evento, pra não poluir a otimização da campanha com dado negativo.
  if (tier === 'qualified') {
    await sendMetaEvent({
      eventName: 'FormSubmitted',
      eventId: `${leadId}_form`,
      eventSourceUrl,
      userData,
      customData,
    })

    await sendMetaEvent({
      eventName: 'QualifiedLead',
      eventId: `${leadId}_lead`,
      eventSourceUrl,
      userData,
      customData,
    })
  }

  const response: SubmitLeadResponse = { leadId, score }
  res.status(200).json(response)
}
