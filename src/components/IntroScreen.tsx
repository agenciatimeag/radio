import { motion } from 'framer-motion'
import { Brand } from './Brand'
import { Grain } from './Grain'
import { Button } from './ui/button'
import { CLINIC_NAME, CLINIC_TAGLINE, HERO_PHOTO_URL } from '../config'

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

      <div
        className={`relative w-full shrink-0 overflow-hidden ${HERO_PHOTO_URL ? 'h-[46vh] min-h-[280px]' : 'h-[26vh] min-h-[180px]'}`}
      >
        {HERO_PHOTO_URL ? (
          <img
            src={HERO_PHOTO_URL}
            alt="Dr. Guilherme Rocha"
            className="h-full w-full object-cover object-top grayscale-[15%]"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_35%,var(--color-surface-active),var(--color-bg)_75%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
        <div className="absolute inset-x-0 top-0 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+20px)]">
          <Brand size="sm" />
        </div>
      </div>

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
