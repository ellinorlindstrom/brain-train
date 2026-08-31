import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDomain } from '../domains'
import { GAME_COMPONENTS } from '../games'
import { addAttempt, getDifficultyTier } from '../storage'
import type { DomainId } from '../types'

interface RunnerState {
  domainIds: DomainId[]
  source: 'test' | 'practice'
}

type Stage = 'intro' | 'playing'

export default function TestRunner() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as RunnerState | null

  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('intro')
  const [results, setResults] = useState<{ domainId: DomainId; score: number }[]>([])

  const handleComplete = useCallback(
    (score: number) => {
      if (!state) return
      const domainId = state.domainIds[index]
      addAttempt(domainId, score, state.source)
      const updated = [...results, { domainId, score }]
      setResults(updated)
      const nextIndex = index + 1
      if (nextIndex >= state.domainIds.length) {
        navigate('/results', { state: { results: updated, source: state.source } })
      } else {
        setIndex(nextIndex)
        setStage('intro')
      }
    },
    [index, navigate, results, state],
  )

  if (!state || state.domainIds.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-slate-400 mb-4">Inget test valt.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-lg bg-sky-500 text-slate-950 font-semibold"
        >
          Till start
        </button>
      </div>
    )
  }

  const domainId = state.domainIds[index]
  const domain = getDomain(domainId)
  const Game = GAME_COMPONENTS[domainId]

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>
            Övning {index + 1} av {state.domainIds.length}
          </span>
          <span style={{ color: domain.color }}>{domain.name}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(index / state.domainIds.length) * 100}%`,
              backgroundColor: domain.color,
            }}
          />
        </div>
      </div>

      {stage === 'intro' ? (
        <div className="bg-slate-900 rounded-2xl p-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold" style={{ color: domain.color }}>
            {domain.name}
          </h2>
          <p className="text-slate-300">{domain.instructions}</p>
          <button
            onClick={() => setStage('playing')}
            className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition text-slate-950 font-semibold text-lg"
          >
            Starta
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-8 flex justify-center">
          <Game key={domainId} difficulty={getDifficultyTier(domainId)} onComplete={handleComplete} />
        </div>
      )}
    </div>
  )
}
