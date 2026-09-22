import { createHash } from 'node:crypto'

// Cliente para a Meta Conversions API. Fica só no backend — o access token
// nunca pode chegar ao navegador do lead.

const GRAPH_VERSION = 'v21.0'

export interface UserData {
  clientIpAddress?: string
  clientUserAgent?: string
  fbp?: string
  fbc?: string
  externalId?: string
  email?: string
  phone?: string
}

export interface SendMetaEventInput {
  eventName: 'PageView' | 'FormSubmitted' | 'QualifiedLead' | 'DisqualifiedLead' | 'WhatsAppClick'
  eventId: string
  eventSourceUrl: string
  userData: UserData
  customData?: Record<string, unknown>
}

// A Conversions API exige email/telefone normalizados e com hash SHA-256.
export function hashField(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function sendMetaEvent(input: SendMetaEventInput): Promise<void> {
  const datasetId = process.env.META_DATASET_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!datasetId || !accessToken) {
    console.warn(
      `[meta-capi] META_DATASET_ID/META_CAPI_ACCESS_TOKEN não configurados — evento ${input.eventName} não enviado.`,
    )
    return
  }

  const { userData, eventName, eventId, eventSourceUrl, customData } = input

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: {
          client_ip_address: userData.clientIpAddress,
          client_user_agent: userData.clientUserAgent,
          fbp: userData.fbp,
          fbc: userData.fbc,
          external_id: userData.externalId ? hashField(userData.externalId) : undefined,
          em: userData.email ? hashField(userData.email) : undefined,
          ph: userData.phone ? hashField(userData.phone) : undefined,
        },
        custom_data: customData,
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${datasetId}/events?access_token=${accessToken}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const responseBody = await response.text()

  if (!response.ok) {
    console.error(`[meta-capi] Falha ao enviar ${eventName}: ${response.status} ${responseBody}`)
  }
}
