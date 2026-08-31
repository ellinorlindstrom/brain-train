import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'

const TOTAL_TRIALS = 20
const RESPONSE_WINDOW_MS_BY_TIER = { 1: 3200, 2: 2500, 3: 1900 } as const

type Rule = 'parity' | 'magnitude'

interface Trial {
  rule: Rule
  number: number
}

function generateTrial(): Trial {
  const rule: Rule = Math.random() < 0.5 ? 'parity' : 'magnitude'
  const candidates = [1, 2, 3, 4, 6, 7, 8, 9]
  const number = candidates[Math.floor(Math.random() * candidates.length)]
  return { rule, number }
}

export default function FlexibilityGame({ onComplete, difficulty }: GameProps) {
  const responseWindowMs = RESPONSE_WINDOW_MS_BY_TIER[difficulty]
  const [trial, setTrial] = useState<Trial>(() => generateTrial())
  const [trialNum, setTrialNum] = useState(1)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const answeredRef = useRef(false)
  const finishedRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  const finish = useCallback(
    (finalCorrect: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const score = Math.round((finalCorrect / TOTAL_TRIALS) * 100)
      onComplete(score)
    },
    [onComplete],
  )

  const scheduleNext = useCallback(
    (correctSoFar: number, currentTrialNum: number) => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (currentTrialNum >= TOTAL_TRIALS) {
        window.setTimeout(() => finish(correctSoFar), 400)
        return
      }
      window.setTimeout(() => {
        setFeedback(null)
        answeredRef.current = false
        setTrial(generateTrial())
        setTrialNum(currentTrialNum + 1)
      }, 400)
    },
    [finish],
  )

  const registerAnswer = useCallback(
    (isCorrect: boolean) => {
      if (answeredRef.current || finishedRef.current) return
      answeredRef.current = true
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      setFeedback(isCorrect ? 'correct' : 'wrong')
      setCorrectCount((c) => {
        const updated = c + (isCorrect ? 1 : 0)
        scheduleNext(updated, trialNum)
        return updated
      })
    },
    [scheduleNext, trialNum],
  )

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      registerAnswer(false)
    }, responseWindowMs)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, responseWindowMs])

  function handleChoice(choice: 'even' | 'odd' | 'high' | 'low') {
    if (answeredRef.current) return
    const { rule, number } = trial
    const isCorrect =
      rule === 'parity'
        ? (number % 2 === 0 ? 'even' : 'odd') === choice
        : (number > 5 ? 'high' : 'low') === choice
    registerAnswer(isCorrect)
  }

  const isParity = trial.rule === 'parity'
  const borderColor = isParity ? '#60a5fa' : '#f97316'

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-6 text-sm text-slate-400">
        <span>
          {trialNum} / {TOTAL_TRIALS}
        </span>
        <span className="text-emerald-400">Rätt: {correctCount}</span>
      </div>
      <div
        className="w-36 h-36 rounded-2xl flex items-center justify-center text-6xl font-bold bg-slate-800 border-4 transition-colors"
        style={{
          borderColor,
          boxShadow: feedback === 'correct' ? '0 0 20px #34d399' : feedback === 'wrong' ? '0 0 20px #f87171' : 'none',
        }}
      >
        {trial.number}
      </div>
      <div className="text-xs text-slate-500">
        {isParity ? 'Regel: Jämnt eller udda?' : 'Regel: Högre eller lägre än 5?'}
      </div>
      <div className="flex gap-4">
        {isParity ? (
          <>
            <button
              onClick={() => handleChoice('even')}
              className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-95 transition text-slate-950 font-semibold"
            >
              Jämnt
            </button>
            <button
              onClick={() => handleChoice('odd')}
              className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-95 transition text-slate-950 font-semibold"
            >
              Udda
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleChoice('high')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 transition text-slate-950 font-semibold"
            >
              Högre
            </button>
            <button
              onClick={() => handleChoice('low')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 transition text-slate-950 font-semibold"
            >
              Lägre
            </button>
          </>
        )}
      </div>
    </div>
  )
}
