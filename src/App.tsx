import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { questions, type Option } from './data/questions'
import { computeResult } from './lib/scoring'
import { captureAttribution } from './lib/attribution'
import { initMetaPixel } from './lib/metaPixel'
import { submitLead } from './lib/leadsApi'
import { IntroScreen } from './components/IntroScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ResultScreen } from './components/ResultScreen'

type Step =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'submitting' }
  | { kind: 'result' }

function App() {
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [answers, setAnswers] = useState<Option[]>([])
  const [detailText, setDetailText] = useState<string | undefined>(undefined)
  const [leadId, setLeadId] = useState<string | undefined>(undefined)

  useEffect(() => {
    captureAttribution()
    initMetaPixel()
  }, [])

  function handleStart() {
    setStep({ kind: 'question', index: 0 })
  }

  function handleAnswer(index: number, option: Option, text?: string) {
    const next = [...answers.slice(0, index), option]
    setAnswers(next)
    const detail = text ?? detailText
    if (text) setDetailText(text)

    if (index + 1 < questions.length) {
      setStep({ kind: 'question', index: index + 1 })
      return
    }

    setStep({ kind: 'submitting' })
    submitLead(
      next.map((option, i) => ({ questionId: questions[i].id, optionId: option.id })),
      detail,
    ).then((response) => {
      if (response) setLeadId(response.leadId)
      setStep({ kind: 'result' })
    })
  }

  function handleBack(index: number) {
    setStep(index === 0 ? { kind: 'intro' } : { kind: 'question', index: index - 1 })
  }

  const result = step.kind === 'result' || step.kind === 'submitting' ? computeResult(answers) : null

  return (
    <AnimatePresence mode="wait">
      {step.kind === 'intro' && (
        <motion.div key="intro" exit={{ opacity: 0 }}>
          <IntroScreen onStart={handleStart} />
        </motion.div>
      )}

      {step.kind === 'question' && (
        <motion.div
          key={`question-${step.index}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionScreen
            question={questions[step.index]}
            step={step.index + 1}
            total={questions.length}
            onAnswer={(option, text) => handleAnswer(step.index, option, text)}
            onBack={() => handleBack(step.index)}
          />
        </motion.div>
      )}

      {step.kind === 'submitting' && (
        <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg text-text">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        </motion.div>
      )}

      {step.kind === 'result' && result && (
        <motion.div key="result" exit={{ opacity: 0 }}>
          <ResultScreen tier={result.tier} score={result.score} detail={detailText} leadId={leadId} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
