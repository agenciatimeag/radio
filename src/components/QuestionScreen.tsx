import { useState } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Option, Question } from '../data/questions'
import { ProgressBar } from './ProgressBar'
import { Brand } from './Brand'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface QuestionScreenProps {
  question: Question
  step: number
  total: number
  onAnswer: (option: Option, text?: string) => void
  onBack?: () => void
}

export function QuestionScreen({ question, step, total, onAnswer, onBack }: QuestionScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [textValue, setTextValue] = useState('')

  const selectedOption = question.options.find((o) => o.id === selectedId)
  const awaitingText = selectedOption?.requiresText ?? false

  function handleSelect(option: Option) {
    if (selectedId) return
    setSelectedId(option.id)
    if (!option.requiresText) {
      window.setTimeout(() => onAnswer(option), 320)
    }
  }

  function handleTextSubmit() {
    if (!selectedOption || !textValue.trim()) return
    onAnswer(selectedOption, textValue.trim())
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-6 py-6 text-text">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Voltar"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-border text-text transition-opacity',
            onBack ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
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
        <Brand size="sm" />
      </div>

      <div className="mt-10 flex-1">
        <h2 className="font-display text-xl font-semibold leading-snug text-text">
          {question.title}
        </h2>

        <RadioGroup.Root value={selectedId ?? undefined} className="mt-8 flex flex-col gap-3">
          {question.options.map((option) => {
            const isSelected = selectedId === option.id
            const isDimmed = selectedId !== null && !isSelected

            return (
              <RadioGroup.Item
                key={option.id}
                value={option.id}
                onClick={() => handleSelect(option)}
                className={cn(
                  'flex items-center gap-3.5 rounded-2xl border px-4 py-4 text-left text-[15px] leading-snug transition-all duration-200',
                  isSelected
                    ? 'border-accent bg-accent text-on-accent shadow-[0_0_32px_-10px_rgba(237,233,166,0.55)]'
                    : 'border-border bg-surface text-text active:border-border-strong',
                  isDimmed && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors',
                    isSelected ? 'border-on-accent/30 bg-on-accent/10' : 'border-border-strong',
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span>{option.label}</span>
              </RadioGroup.Item>
            )
          })}
        </RadioGroup.Root>

        <AnimatePresence>
          {awaitingText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <textarea
                id="outros-assuntos"
                autoFocus
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Conte rapidamente o que você busca"
                rows={3}
                className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={!textValue.trim()}
                  onClick={handleTextSubmit}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
