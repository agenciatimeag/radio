import { getAttribution } from './attribution'
import type { AnswerPayload, SubmitLeadResponse } from './leadPayload'

export async function submitLead(
  answers: AnswerPayload[],
  detail?: string,
): Promise<SubmitLeadResponse | null> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        detail,
        attribution: getAttribution(),
        eventSourceUrl: window.location.href,
      }),
    })
    if (!response.ok) return null
    return (await response.json()) as SubmitLeadResponse
  } catch {
    return null
  }
}

export function trackPageView(): void {
  const attribution = getAttribution()
  fetch('/api/track-pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      fbclid: attribution.fbclid,
    }),
  }).catch(() => {})
}

// sendBeacon não bloqueia a navegação para o WhatsApp — importante porque o
// clique precisa abrir o WhatsApp imediatamente, sem esperar a rede.
export function notifyWhatsAppClick(leadId: string, qualified: boolean): void {
  const payload = JSON.stringify({
    leadId,
    qualified,
    eventSourceUrl: window.location.href,
    ...getAttribution(),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/whatsapp-click', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }
}
