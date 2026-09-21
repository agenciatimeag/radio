import { CLINIC_NAME, CLINIC_TAGLINE } from '../config'

interface BrandProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'lg'
}

export function Brand({ variant = 'dark', size = 'sm' }: BrandProps) {
  const isDark = variant === 'dark'
  const monogramSize = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`flex ${monogramSize} items-center justify-center rounded-full border font-serif tracking-wide ${
          isDark
            ? 'border-gold/60 text-gold shadow-[0_0_0_1px_rgba(217,184,114,0.12),0_0_28px_-6px_rgba(217,184,114,0.45)]'
            : 'border-forest-900/25 text-forest-900'
        }`}
      >
        GR
      </div>
      {size === 'lg' && (
        <div className="text-center">
          <p
            className={`font-serif text-2xl tracking-wide ${isDark ? 'text-cream' : 'text-forest-900'}`}
          >
            {CLINIC_NAME}
          </p>
          <p
            className={`mt-1 text-xs uppercase tracking-[0.2em] ${
              isDark ? 'text-gold/80' : 'text-forest-700/70'
            }`}
          >
            {CLINIC_TAGLINE}
          </p>
        </div>
      )}
    </div>
  )
}
