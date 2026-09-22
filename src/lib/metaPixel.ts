// Carrega o Meta Pixel no navegador (para PageView e para gerar os cookies
// _fbp/_fbc que a Conversions API usa pra casar o lead com o clique no anúncio).
// Sem VITE_META_PIXEL_ID configurado, isso não faz nada — seguro de deixar
// no código antes de ter o ID real.

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

export function initMetaPixel(): void {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID
  if (!pixelId || window.fbq) return

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
    } else {
      fbq.queue.push(args)
    }
  }) as Fbq
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'

  window.fbq = fbq
  window._fbq ??= fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}
