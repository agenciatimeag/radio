import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock3, Info } from 'lucide-react'
import { Brand } from './Brand'
import { Grain } from './Grain'
import { WhatsAppButton } from './WhatsAppButton'
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from '../config'
import { trackLeadResult } from '../lib/analytics'
import type { LeadTier } from '../lib/scoring'

interface ResultScreenProps {
  tier: LeadTier
  score: number
}

const ICON_BY_TIER: Record<LeadTier, typeof Check> = {
  qualified: Check,
  toQualify: Clock3,
  disqualified: Info,
}

export function ResultScreen({ tier, score }: ResultScreenProps) {
  useEffect(() => {
    trackLeadResult(tier, score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Icon = ICON_BY_TIER[tier]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-forest-950 bg-[radial-gradient(circle_at_50%_0%,var(--color-forest-800),var(--color-forest-950)_60%)] px-6 py-12 text-cream"
    >
      <Grain />
      <Brand variant="dark" size="sm" />

      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-7 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.06] text-gold shadow-[0_0_0_1px_rgba(217,184,114,0.08),0_20px_40px_-18px_rgba(217,184,114,0.55)]"
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </motion.div>

        <span className="text-[11px] uppercase tracking-[0.25em] text-gold/70">
          Avaliação concluída
        </span>

        {tier === 'qualified' && <QualifiedContent />}
        {tier === 'toQualify' && <ToQualifyContent />}
        {tier === 'disqualified' && <DisqualifiedContent />}
      </div>

      <div className="w-full max-w-sm space-y-3">
        {tier === 'qualified' && (
          <WhatsAppButton
            href={buildWhatsAppLink(WHATSAPP_MESSAGES.qualified)}
            label="Agendar minha consulta no WhatsApp"
          />
        )}
        {tier === 'toQualify' && (
          <WhatsAppButton
            href={buildWhatsAppLink(WHATSAPP_MESSAGES.toQualify)}
            label="Falar no WhatsApp"
          />
        )}
        {tier === 'disqualified' && (
          <>
            <p className="text-center text-xs leading-relaxed text-cream/50">
              Mesmo assim, quero falar com a concierge
            </p>
            <WhatsAppButton
              href={buildWhatsAppLink(WHATSAPP_MESSAGES.disqualified)}
              label="Falar com a concierge mesmo assim"
              variant="outline"
            />
          </>
        )}
      </div>
    </motion.div>
  )
}

function QualifiedContent() {
  return (
    <>
      <h1 className="font-serif text-[26px] leading-snug text-cream">
        Você tem o perfil ideal para o nosso programa
      </h1>
      <p className="text-sm leading-relaxed text-cream/70">
        Pelo que você compartilhou, o acompanhamento do Dr. Guilherme Rocha faz muito sentido para
        o seu momento. O próximo passo é conversar com a nossa concierge para agendar sua
        consulta.
      </p>
    </>
  )
}

function ToQualifyContent() {
  return (
    <>
      <h1 className="font-serif text-[26px] leading-snug text-cream">
        Vamos conversar sobre o seu caso
      </h1>
      <p className="text-sm leading-relaxed text-cream/70">
        Nossa concierge vai te ajudar a entender os próximos passos.
      </p>
    </>
  )
}

function DisqualifiedContent() {
  return (
    <>
      <h1 className="font-serif text-[26px] leading-snug text-cream">
        Ainda não é o momento ideal
      </h1>
      <p className="text-sm leading-relaxed text-cream/70">
        Pelo que você compartilhou, seu perfil ainda não compõe o que buscamos atender hoje.
        Alguns pontos importantes sobre o nosso trabalho:
      </p>
      <ul className="w-full space-y-2 text-left text-sm leading-relaxed text-cream/70">
        <li className="flex gap-2">
          <span className="text-gold">•</span>
          Nossos tratamentos partem de um investimento a partir de R$ 7.000.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">•</span>
          Nossa clínica atende exclusivamente de forma presencial, na cidade de Guarapari/ES.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">•</span>
          Não trabalhamos com outros tipos de tratamento além dos nossos protocolos de medicina
          metabólica.
        </li>
      </ul>
    </>
  )
}
