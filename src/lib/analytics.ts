import type { LeadTier } from './scoring'

// Cada tela de resultado precisa mandar um sinal DIFERENTE pro Meta (Pixel/CAPI),
// porque é isso que permite o Meta otimizar a campanha por qualidade de lead —
// não só por volume de contato no WhatsApp.
//
// Por enquanto isso só registra o evento no console e (se o Pixel do Meta
// estiver instalado — ver META_PIXEL_ID em config.ts) dispara via fbq no
// navegador. O envio server-side via Conversions API (mais confiável, não
// depende de bloqueador de anúncio no navegador do lead) é o próximo passo,
// quando tivermos o access token do Meta.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

const EVENT_BY_TIER: Record<LeadTier, string> = {
  qualified: 'Lead_Qualificado',
  toQualify: 'Lead_AQualificar',
  disqualified: 'Lead_Desqualificado',
}

export function trackLeadResult(tier: LeadTier, score: number) {
  const eventName = EVENT_BY_TIER[tier]

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, { lead_score: score, lead_tier: tier })
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${eventName}`, { score, tier })
  }
}
