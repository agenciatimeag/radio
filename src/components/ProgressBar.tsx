interface ProgressBarProps {
  step: number
  total: number
}

export function ProgressBar({ step, total }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-forest-700/70">
        <span>
          Etapa {step} de {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-forest-900/10">
        <div
          className="h-full rounded-full bg-gold-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
