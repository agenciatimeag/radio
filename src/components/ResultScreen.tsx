import { Check, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Grain } from './Grain'
import { HeroPhoto } from './HeroPhoto'
import { WhatsAppButton } from './WhatsAppButton'
import { buildWhatsAppLink, WHATSAPP_MESSAGES } from '../config'
import type { LeadTier } from '../lib/scoring'

interface ResultScreenProps {
  tier: LeadTier
  score: number
  detail?: string
  leadId?: string
}

const ICON_BY_TIER: Record<LeadTier, typeof Check> = {
  qualified: Check,
  disqualified: Info,
}

export function ResultScreen({ tier, detail, leadId }: ResultScreenProps) {
  const Icon = ICON_BY_TIER[tier]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-bg text-text"
    >
      <Grain />

      <HeroPhoto size="md" />

      <div className="relative -mt-10 flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/[0.08] text-accent shadow-[0_0_0_1px_rgba(237,233,166,0.1),0_20px_40px_-18px_rgba(237,233,166,0.55)]"
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </motion.div>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-accent/80">
            Avaliação concluída
          </span>

          {tier === 'qualified' && <QualifiedContent />}
          {tier === 'disqualified' && <DisqualifiedContent />}
        </div>

        <div className="w-full max-w-sm space-y-3">
          {tier === 'qualified' && (
            <WhatsAppButton
              href={buildWhatsAppLink(WHATSAPP_MESSAGES.qualified, detail)}
              label="Falar com concierge"
              variant="whatsapp"
              leadId={leadId}
              qualified
            />
          )}
          {tier === 'disqualified' && (
            <>
              <p className="text-center text-xs leading-relaxed text-text-muted">
                Se ainda assim você deseja entender melhor o seu caso e conversar com nossa
                equipe, nossa concierge pode te orientar.
              </p>
              <WhatsAppButton
                href={buildWhatsAppLink(WHATSAPP_MESSAGES.disqualified, detail)}
                label="Quero falar com a concierge"
                variant="outline"
                leadId={leadId}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function QualifiedContent() {
  return (
    <>
      <h1 className="font-display text-[26px] font-semibold leading-snug text-text">
        Você tem o perfil ideal para o nosso programa
      </h1>
      <p className="text-sm leading-relaxed text-text-muted">
        Pelo que você compartilhou, o acompanhamento do Dr. Guilherme Rocha faz muito sentido para
        o seu momento. O próximo passo é conversar com a nossa concierge para agendar sua
        consulta.
      </p>
    </>
  )
}

function DisqualifiedContent() {
  return (
    <>
      <h1 className="font-display text-[26px] font-semibold leading-snug text-text">
        Ainda não é o momento ideal
      </h1>
      <p className="text-sm leading-relaxed text-text-muted">
        Pelas suas respostas, pode ainda não ser o momento ideal para um tratamento desse nível.
      </p>
      <p className="text-sm leading-relaxed text-text-muted">Antes de seguir, é importante considerar que:</p>
      <ul className="w-full space-y-2 text-left text-sm leading-relaxed text-text-muted">
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          Nossos tratamentos partem de um investimento de R$ 4.000.
        </li>
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          O atendimento é realizado exclusivamente de forma presencial, em Guarapari/ES.
        </li>
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          Nossa atuação é voltada aos protocolos 100% personalizados de medicina metabólica
          oferecidos pelo Instituto.
        </li>
      </ul>
    </>
  )
}
