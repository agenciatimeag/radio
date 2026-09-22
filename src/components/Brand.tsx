import { CLINIC_NAME, CLINIC_TAGLINE } from '../config'

interface BrandProps {
  size?: 'sm' | 'lg'
}

export function Brand({ size = 'sm' }: BrandProps) {
  const monogramSize = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`flex ${monogramSize} items-center justify-center shadow-[0_0_28px_-8px_rgba(237,233,166,0.5)]`}
      >
        <img src="logo-mark.png" alt="G.Rocha" className="h-full w-full object-cover" />
      </div>
      {size === 'lg' && (
        <div className="text-center">
          <p className="font-display text-2xl font-semibold tracking-wide text-text">
            {CLINIC_NAME}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-accent/80">
            {CLINIC_TAGLINE}
          </p>
        </div>
      )}
    </div>
  )
}
