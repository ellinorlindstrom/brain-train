import { useCallback, useEffect, useRef, useState } from 'react'
import type { DifficultyTier, GameProps } from '../types'

const DURATION_SEC = 40
const EXPECTED_NET_MAX = 22

interface Problem {
  text: string
  isCorrect: boolean
}

function generateProblem(difficulty: DifficultyTier): Problem {
  const range = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 40
  const useSubtraction = difficulty === 3 && Math.random() < 0.5
  const a = Math.floor(Math.random() * range) + 1
  const b = Math.floor(Math.random() * range) + 1
  const correctAnswer = useSubtraction ? a - b : a + b
  const deviation = difficulty === 3 ? 1 : difficulty === 2 ? 2 : 4
  const showCorrect = Math.random() < 0.5
  const offset = Math.floor(Math.random() * deviation) + 1
  const shown = showCorrect ? correctAnswer : correctAnswer + (Math.random() < 0.5 ? offset : -offset)
  return {
    text: `${a} ${useSubtraction ? '-' : '+'} ${b} = ${shown}`,
    isCorrect: shown === correctAnswer,
  }
}

export default function SpeedGame({ onComplete, difficulty }: GameProps) {
  const [problem, setProblem] = useState<Problem>(() => generateProblem(difficulty))
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const finishedRef = useRef(false)
  const statsRef = useRef({ correct: 0, wrong: 0 })

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const net = Math.max(0, statsRef.current.correct - statsRef.current.wrong * 0.5)
    const score = Math.min(100, Math.round((net / EXPECTED_NET_MAX) * 100))
    onComplete(score)
  }, [onComplete])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(interval)
          finish()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [finish])

  function answer(choice: boolean) {
    if (finishedRef.current) return
    if (choice === problem.isCorrect) {
      statsRef.current.correct += 1
      setCorrect((c) => c + 1)
    } else {
      statsRef.current.wrong += 1
      setWrong((w) => w + 1)
    }
    setProblem(generateProblem(difficulty))
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-6 text-sm text-slate-400">
        <span>⏱ {timeLeft}s</span>
        <span className="text-emerald-400">Rätt: {correct}</span>
        <span className="text-rose-400">Fel: {wrong}</span>
      </div>
      <div className="text-4xl font-bold tabular-nums">{problem.text}</div>
      <div className="flex gap-4">
        <button
          onClick={() => answer(true)}
          className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition text-slate-950 font-semibold text-lg"
        >
          Rätt
        </button>
        <button
          onClick={() => answer(false)}
          className="px-8 py-4 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 transition text-slate-950 font-semibold text-lg"
        >
          Fel
        </button>
      </div>
    </div>
  )
}
