// Configurações do Instituto Guilherme Rocha — ajuste aqui sem mexer no resto do app.

export const CLINIC_NAME = 'Instituto Guilherme Rocha'
export const CLINIC_TAGLINE = 'Medicina Metabólica de Precisão'

export const WHATSAPP_NUMBER = '5527995223099'

// TODO: colar aqui a foto do Dr. Guilherme (ex: '/hero-guilherme.jpg', em public/).
// Sem foto, a tela inicial usa um fundo escuro com glow no lugar.
export const HERO_PHOTO_URL = ''

export const WHATSAPP_MESSAGES = {
  qualified:
    'Olá! Preenchi o formulário do Instituto Guilherme Rocha e gostaria de agendar minha consulta.',
  toQualify:
    'Olá! Preenchi o formulário do Instituto Guilherme Rocha e gostaria de conversar sobre uma consulta.',
  disqualified:
    'Olá! Vi que talvez meu perfil não seja o ideal no momento, mas gostaria de falar com a concierge mesmo assim.',
} as const

export function buildWhatsAppLink(message: string, detail?: string): string {
  const text = detail ? `${message}\n\nDetalhe: ${detail}` : message
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
