import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'

const TILE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316']
const MAX_USEFUL_LEVEL = 9

type Phase = 'ready' | 'showing' | 'input' | 'done'

export default function MemoryGame({ onComplete, difficulty }: GameProps) {
  const startLength = 2 + difficulty // tier 1: 3, tier 2: 4, tier 3: 5
  const [phase, setPhase] = useState<Phase>('ready')
  const [sequence, setSequence] = useState<number[]>([])
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [inputIndex, setInputIndex] = useState(0)
  const [level, setLevel] = useState(0)
  const finishedRef = useRef(false)

  const finish = useCallback(
    (reachedLevel: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const score = Math.min(100, Math.round((reachedLevel / MAX_USEFUL_LEVEL) * 100))
      setPhase('done')
      window.setTimeout(() => onComplete(score), 900)
    },
    [onComplete],
  )

  const playSequence = useCallback(async (seq: number[]) => {
    setPhase('showing')
    await new Promise((r) => setTimeout(r, 500))
    for (const tile of seq) {
      setActiveTile(tile)
      await new Promise((r) => setTimeout(r, 550))
      setActiveTile(null)
      await new Promise((r) => setTimeout(r, 250))
    }
    setInputIndex(0)
    setPhase('input')
  }, [])

  const start = useCallback(() => {
    const first = Array.from({ length: startLength }, () => Math.floor(Math.random() * 6))
    setSequence(first)
    setLevel(0)
    void playSequence(first)
  }, [playSequence, startLength])

  useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function flashTile(tile: number) {
    setActiveTile(tile)
    window.setTimeout(() => setActiveTile(null), 200)
  }

  function handleTileClick(tile: number) {
    if (phase !== 'input') return
    flashTile(tile)
    if (tile === sequence[inputIndex]) {
      const nextIndex = inputIndex + 1
      if (nextIndex === sequence.length) {
        const newLevel = level + 1
        setLevel(newLevel)
        if (newLevel >= MAX_USEFUL_LEVEL) {
          finish(newLevel)
          return
        }
        const nextSeq = [...sequence, Math.floor(Math.random() * 6)]
        setSequence(nextSeq)
        window.setTimeout(() => void playSequence(nextSeq), 500)
      } else {
        setInputIndex(nextIndex)
      }
    } else {
      finish(level)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-slate-300 text-sm">
        {phase === 'showing' && 'Titta noga...'}
        {phase === 'input' && `Din tur! (${inputIndex}/${sequence.length})`}
        {phase === 'done' && 'Klart!'}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {TILE_COLORS.map((color, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            disabled={phase !== 'input'}
            className="w-20 h-20 rounded-xl transition-all duration-150 disabled:cursor-default"
            style={{
              backgroundColor: color,
              opacity: activeTile === i ? 1 : phase === 'input' ? 0.85 : 0.35,
              transform: activeTile === i ? 'scale(1.08)' : 'scale(1)',
              boxShadow: activeTile === i ? `0 0 24px ${color}` : 'none',
            }}
          />
        ))}
      </div>
      <div className="text-slate-400 text-sm">Nivå klarad: {level}</div>
    </div>
  )
}
