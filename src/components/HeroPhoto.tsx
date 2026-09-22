import { Brand } from './Brand'
import { HERO_PHOTO_URL } from '../config'

interface HeroPhotoProps {
  size?: 'lg' | 'md'
}

const HEIGHT_CLASS: Record<'lg' | 'md', string> = {
  lg: HERO_PHOTO_URL ? 'h-[46vh] min-h-[280px]' : 'h-[26vh] min-h-[180px]',
  md: HERO_PHOTO_URL ? 'h-[34vh] min-h-[220px]' : 'h-[20vh] min-h-[140px]',
}

// Foto do Dr. Guilherme com degradê pro fundo escuro — usada na tela inicial
// e nas telas de resultado, pra reforçar a mesma identidade em todo o fluxo.
export function HeroPhoto({ size = 'lg' }: HeroPhotoProps) {
  return (
    <div className={`relative w-full shrink-0 overflow-hidden ${HEIGHT_CLASS[size]}`}>
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
  )
}
