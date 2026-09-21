import { useState } from 'react'
import type { Option, Question } from '../data/questions'
import { ProgressBar } from './ProgressBar'
import { Brand } from './Brand'

interface QuestionScreenProps {
  question: Question
  step: number
  total: number
  onAnswer: (option: Option) => void
  onBack?: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuestionScreen({ question, step, total, onAnswer, onBack }: QuestionScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleSelect(option: Option) {
    if (selectedId) return
    setSelectedId(option.id)
    window.setTimeout(() => onAnswer(option), 320)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream px-6 py-6 text-ink">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Voltar"
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-forest-900/15 text-forest-900 transition-opacity ${
            onBack ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar step={step} total={total} />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Brand variant="light" size="sm" />
      </div>

      <div className="mt-10 flex-1">
        <h2 className="font-serif text-xl leading-snug text-forest-950">{question.title}</h2>

        <div className="mt-8 flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedId === option.id
            const isDimmed = selectedId !== null && !isSelected

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-[15px] leading-snug transition-all duration-200 ${
                  isSelected
                    ? 'border-gold-600 bg-forest-900 text-cream'
                    : 'border-forest-900/12 bg-white text-forest-950 active:border-gold-600/60'
                } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isSelected ? 'bg-gold-600 text-forest-950' : 'bg-forest-900/8 text-forest-800'
                  }`}
                >
                  {LETTERS[index]}
                </span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
