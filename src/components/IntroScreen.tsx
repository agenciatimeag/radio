import { motion } from 'framer-motion'
import { Brand } from './Brand'

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-dvh flex-col items-center justify-between bg-forest-950 bg-[radial-gradient(circle_at_50%_0%,var(--color-forest-800),var(--color-forest-950)_60%)] px-6 py-12 text-cream"
    >
      <div />

      <div className="flex flex-col items-center gap-8 text-center">
        <Brand variant="dark" size="lg" />

        <div className="h-px w-16 bg-gold/40" />

        <div className="space-y-3">
          <h1 className="font-serif text-[26px] leading-snug text-cream">
            Uma avaliação rápida
            <br />
            antes da sua consulta
          </h1>
          <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-cream/70">
            Responda 4 perguntas simples para que o Dr. Guilherme Rocha e sua equipe já cheguem à
            conversa entendendo o seu momento.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-gold-600 px-6 py-4 text-sm font-semibold tracking-wide text-forest-950 shadow-[0_8px_24px_-8px_rgba(217,184,114,0.6)] transition-transform active:scale-[0.98]"
        >
          Iniciar avaliação
        </button>
        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-cream/40">
          Leva menos de 1 minuto
        </p>
      </div>
    </motion.div>
  )
}
