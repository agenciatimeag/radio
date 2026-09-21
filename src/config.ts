// Configurações do Instituto Guilherme Rocha — ajuste aqui sem mexer no resto do app.

export const CLINIC_NAME = 'Instituto Guilherme Rocha'
export const CLINIC_TAGLINE = 'Medicina Metabólica de Precisão'

export const WHATSAPP_NUMBER = '5527995223099'

export const WHATSAPP_MESSAGES = {
  qualified:
    'Olá! Preenchi o formulário do Instituto Guilherme Rocha e gostaria de agendar minha consulta.',
  toQualify:
    'Olá! Preenchi o formulário do Instituto Guilherme Rocha e gostaria de conversar sobre uma consulta.',
  disqualified:
    'Olá! Vi que talvez meu perfil não seja o ideal no momento, mas gostaria de falar com a concierge mesmo assim.',
} as const

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
