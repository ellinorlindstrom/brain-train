import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DifficultyTier, GameProps } from '../types'

interface Question {
  sequence: string
  options: number[]
  answer: number
  level: DifficultyTier
}

const QUESTION_POOL: Question[] = [
  { sequence: '2, 4, 6, 8, ?', options: [9, 10, 12, 11], answer: 10, level: 1 },
  { sequence: '1, 2, 3, 4, ?', options: [5, 6, 7, 4], answer: 5, level: 1 },
  { sequence: '5, 10, 15, 20, ?', options: [22, 24, 25, 30], answer: 25, level: 1 },
  { sequence: '20, 17, 14, 11, ?', options: [9, 8, 7, 10], answer: 8, level: 1 },
  { sequence: '3, 6, 9, 12, ?', options: [14, 15, 16, 18], answer: 15, level: 2 },
  { sequence: '1, 2, 4, 8, ?', options: [12, 16, 14, 10], answer: 16, level: 2 },
  { sequence: '1, 4, 9, 16, ?', options: [20, 24, 25, 22], answer: 25, level: 2 },
  { sequence: '100, 90, 80, 70, ?', options: [50, 55, 60, 65], answer: 60, level: 2 },
  { sequence: '1, 3, 6, 10, ?', options: [14, 15, 13, 16], answer: 15, level: 2 },
  { sequence: '1, 1, 2, 3, 5, ?', options: [6, 7, 8, 9], answer: 8, level: 3 },
  { sequence: '5, 10, 20, 40, ?', options: [60, 70, 80, 90], answer: 80, level: 3 },
  { sequence: '2, 3, 5, 8, 13, ?', options: [18, 19, 20, 21], answer: 21, level: 3 },
  { sequence: '3, 9, 27, 81, ?', options: [162, 189, 243, 216], answer: 243, level: 3 },
  { sequence: '81, 27, 9, 3, ?', options: [1, 2, 0, -1], answer: 1, level: 3 },
]

const QUESTION_COUNT = 8
const TIME_PER_QUESTION = 15

function pickQuestions(difficulty: DifficultyTier): Question[] {
  const weighted = QUESTION_POOL.filter((q) => Math.abs(q.level - difficulty) <= 1)
  const pool = weighted.length >= QUESTION_COUNT ? weighted : QUESTION_POOL
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, QUESTION_COUNT)
}

export default function LogicGame({ onComplete, difficulty }: GameProps) {
  const questions = useMemo(() => pickQuestions(difficulty), [difficulty])
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const answeredRef = useRef(false)
  const finishedRef = useRef(false)

  const finish = useCallback(
    (finalCorrect: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const score = Math.round((finalCorrect / QUESTION_COUNT) * 100)
      onComplete(score)
    },
    [onComplete],
  )

  const goNext = useCallback(
    (correctSoFar: number) => {
      setFeedback(null)
      answeredRef.current = false
      setIndex((i) => {
        const next = i + 1
        if (next >= questions.length) {
          finish(correctSoFar)
          return i
        }
        setTimeLeft(TIME_PER_QUESTION)
        return next
      })
    },
    [finish, questions.length],
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((t) => {
        if (answeredRef.current || finishedRef.current) return t
        if (t <= 1) {
          answeredRef.current = true
          setFeedback('wrong')
          window.setTimeout(() => {
            setCorrectCount((c) => {
              goNext(c)
              return c
            })
          }, 600)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function handleAnswer(value: number) {
    if (answeredRef.current) return
    answeredRef.current = true
    const q = questions[index]
    const isCorrect = value === q.answer
    setFeedback(isCorrect ? 'correct' : 'wrong')
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    setCorrectCount(newCorrect)
    window.setTimeout(() => goNext(newCorrect), 600)
  }

  const q = questions[index]

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      <div className="flex justify-between w-full text-sm text-slate-400">
        <span>
          Fråga {index + 1} / {questions.length}
        </span>
        <span>⏱ {timeLeft}s</span>
      </div>
      <div className="text-3xl font-bold tracking-wide tabular-nums">{q.sequence}</div>
      <div className="grid grid-cols-2 gap-4 w-full">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            disabled={feedback !== null}
            className={`py-4 rounded-xl text-xl font-semibold transition active:scale-95 ${
              feedback && opt === q.answer
                ? 'bg-emerald-500 text-slate-950'
                : feedback === 'wrong' && opt !== q.answer
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-violet-500 hover:bg-violet-400 text-slate-950'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="text-slate-500 text-sm">Rätt hittills: {correctCount}</div>
    </div>
  )
}
