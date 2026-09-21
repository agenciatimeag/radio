interface ProgressBarProps {
  step: number
  total: number
}

export function ProgressBar({ step, total }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, index) => {
          const isDone = index < step
          return (
            <div key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-forest-900/10">
              <div
                className={`h-full rounded-full bg-gold-600 transition-all duration-500 ease-out ${
                  isDone ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-forest-700/60">
        <span>
          Etapa {step} de {total}
        </span>
      </div>
    </div>
  )
}
