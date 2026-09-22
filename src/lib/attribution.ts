import type { AttributionData } from './leadPayload'

const STORAGE_KEY = 'igr_attribution'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Captura utm_*/fbclid da URL de entrada (a do clique no anúncio) uma única
// vez por sessão e guarda em sessionStorage, para que sobreviva até o envio
// do formulário mesmo se a pessoa demorar a responder.
export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const params = new URLSearchParams(window.location.search)
    const data: AttributionData = {}

    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) data[key] = value
    }

    const fbclid = params.get('fbclid')
    if (fbclid) data.fbclid = fbclid

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage indisponível (modo privado etc.) — segue sem atribuição.
  }
}

export function getAttribution(): AttributionData {
  let stored: AttributionData = {}
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    stored = {}
  }

  return {
    ...stored,
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
  }
}
