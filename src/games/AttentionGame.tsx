import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'

const TOTAL_TRIALS = 24
const TARGET_LETTER = 'X'
const OTHER_LETTERS = ['A', 'B', 'E', 'H', 'K', 'M', 'N', 'P', 'R', 'T', 'W', 'Y', 'Z']
const STIMULUS_MS_BY_TIER = { 1: 850, 2: 700, 3: 550 } as const

function randomLetter(): string {
  return Math.random() < 0.3
    ? TARGET_LETTER
    : OTHER_LETTERS[Math.floor(Math.random() * OTHER_LETTERS.length)]
}

export default function AttentionGame({ onComplete, difficulty }: GameProps) {
  const stimulusMs = STIMULUS_MS_BY_TIER[difficulty]
  const [trialIndex, setTrialIndex] = useState(-1)
  const [letter, setLetter] = useState('')
  const [finished, setFinished] = useState(false)
  const statsRef = useRef({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 })
  const respondedRef = useRef(false)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const { hits, correctRejections } = statsRef.current
    const score = Math.round(((hits + correctRejections) / TOTAL_TRIALS) * 100)
    setFinished(true)
    window.setTimeout(() => onComplete(score), 700)
  }, [onComplete])

  const nextTrial = useCallback(
    (index: number) => {
      if (index >= TOTAL_TRIALS) {
        finish()
        return
      }
      const l = randomLetter()
      respondedRef.current = false
      setLetter(l)
      setTrialIndex(index)
      window.setTimeout(() => {
        if (!respondedRef.current) {
          if (l === TARGET_LETTER) statsRef.current.misses += 1
          else statsRef.current.correctRejections += 1
        }
        nextTrial(index + 1)
      }, stimulusMs)
    },
    [finish, stimulusMs],
  )

  useEffect(() => {
    nextTrial(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleReact() {
    if (respondedRef.current || finished) return
    respondedRef.current = true
    if (letter === TARGET_LETTER) statsRef.current.hits += 1
    else statsRef.current.falseAlarms += 1
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-slate-400 text-sm">
        {finished ? 'Klart!' : `${Math.max(trialIndex + 1, 1)} / ${TOTAL_TRIALS}`}
      </div>
      <div className="w-40 h-40 rounded-2xl bg-slate-800 flex items-center justify-center text-6xl font-bold">
        {!finished && letter}
      </div>
      <button
        onClick={handleReact}
        disabled={finished}
        className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition text-slate-950 font-semibold text-lg disabled:opacity-40"
      >
        Reagera!
      </button>
      <p className="text-slate-500 text-xs max-w-xs text-center">
        Reagera bara på bokstaven {TARGET_LETTER}
      </p>
    </div>
  )
}
