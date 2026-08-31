import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DifficultyTier, GameProps } from '../types'

const DURATION_SEC = 45
const EXPECTED_CORRECT_MAX = 9

// Diakritiska tecken (å/ä/ö) undviks medvetet så att skrambling/jämförelse
// blir förutsägbar oavsett tangentbordslayout.
const WORD_POOL_BY_TIER: Record<DifficultyTier, string[]> = {
  1: ['MINNE', 'FOKUS', 'KRAFT', 'LAMPA', 'CYKEL', 'BLOMMA'],
  2: ['STYRKA', 'TANKE', 'SOMMAR', 'VINTER', 'KLOCKA', 'HJARNA'],
  3: ['FONSTER', 'STJARNA', 'TELEFON', 'PAPPER', 'UTVECKLING', 'KONCENTRATION'],
}

function scramble(word: string): string {
  const letters = word.split('')
  let attempt = letters
  let tries = 0
  do {
    for (let i = attempt.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[attempt[i], attempt[j]] = [attempt[j], attempt[i]]
    }
    tries += 1
  } while (attempt.join('') === word && tries < 10)
  return attempt.join('')
}

function pickWords(difficulty: DifficultyTier): string[] {
  return [...WORD_POOL_BY_TIER[difficulty]].sort(() => Math.random() - 0.5)
}

export default function VerbalGame({ onComplete, difficulty }: GameProps) {
  const words = useMemo(() => pickWords(difficulty), [difficulty])
  const [wordIndex, setWordIndex] = useState(0)
  const [scrambled, setScrambled] = useState(() => scramble(words[0]))
  const [input, setInput] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC)
  const [feedback, setFeedback] = useState<'correct' | 'skip' | null>(null)
  const [finished, setFinished] = useState(false)
  const finishedRef = useRef(false)
  const statsRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(true)
    const score = Math.min(100, Math.round((statsRef.current / EXPECTED_CORRECT_MAX) * 100))
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

  useEffect(() => {
    inputRef.current?.focus()
  }, [wordIndex])

  function nextWord() {
    setInput('')
    setFeedback(null)
    setWordIndex((i) => {
      const next = (i + 1) % words.length
      setScrambled(scramble(words[next]))
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (finishedRef.current) return
    if (input.trim().toUpperCase() === words[wordIndex]) {
      statsRef.current += 1
      setCorrectCount((c) => c + 1)
      setFeedback('correct')
      window.setTimeout(nextWord, 400)
    }
  }

  function handleSkip() {
    if (finishedRef.current) return
    setFeedback('skip')
    window.setTimeout(nextWord, 300)
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="flex gap-6 text-sm text-slate-400">
        <span>⏱ {timeLeft}s</span>
        <span className="text-emerald-400">Rätt: {correctCount}</span>
      </div>
      <div className="text-4xl font-bold tracking-[0.3em]">{scrambled}</div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={finished}
          className={`w-full text-center text-xl py-3 rounded-xl bg-slate-800 border-2 outline-none transition-colors ${
            feedback === 'correct' ? 'border-emerald-400' : 'border-slate-700 focus:border-sky-400'
          }`}
          placeholder="Skriv ordet..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition text-slate-950 font-semibold"
          >
            Svara
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition text-slate-200 font-semibold"
          >
            Hoppa över
          </button>
        </div>
      </form>
    </div>
  )
}
