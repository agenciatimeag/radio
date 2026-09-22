import { motion } from 'framer-motion'
import { Grain } from './Grain'
import { HeroPhoto } from './HeroPhoto'
import { Button } from './ui/button'
import { CLINIC_NAME, CLINIC_TAGLINE } from '../config'

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-bg text-text"
    >
      <Grain />

      <HeroPhoto size="lg" />

      <div className="relative -mt-10 flex flex-1 flex-col items-center justify-between px-6 pb-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-tight text-text">
              {CLINIC_NAME}
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-accent/80">
              {CLINIC_TAGLINE}
            </p>
          </div>
          <p className="mx-auto max-w-[300px] text-sm leading-relaxed text-text-muted">
            Para ser direcionado ao setor correto, você vai responder 4 perguntas rápidas.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <Button type="button" onClick={onStart}>
            Falar com a concierge
          </Button>
          <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-text-muted">
            Leva menos de 1 minuto
          </p>
        </div>
      </div>
    </motion.div>
  )
}
