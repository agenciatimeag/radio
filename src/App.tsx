import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { questions, type Option } from './data/questions'
import { computeResult } from './lib/scoring'
import { IntroScreen } from './components/IntroScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ResultScreen } from './components/ResultScreen'

type Step = { kind: 'intro' } | { kind: 'question'; index: number } | { kind: 'result' }

function App() {
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [answers, setAnswers] = useState<Option[]>([])

  function handleStart() {
    setStep({ kind: 'question', index: 0 })
  }

  function handleAnswer(index: number, option: Option) {
    const next = [...answers.slice(0, index), option]
    setAnswers(next)

    if (index + 1 < questions.length) {
      setStep({ kind: 'question', index: index + 1 })
    } else {
      setStep({ kind: 'result' })
    }
  }

  function handleBack(index: number) {
    setStep(index === 0 ? { kind: 'intro' } : { kind: 'question', index: index - 1 })
  }

  const result = step.kind === 'result' ? computeResult(answers) : null

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
            onAnswer={(option) => handleAnswer(step.index, option)}
            onBack={() => handleBack(step.index)}
          />
        </motion.div>
      )}

      {step.kind === 'result' && result && (
        <motion.div key="result" exit={{ opacity: 0 }}>
          <ResultScreen tier={result.tier} score={result.score} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
