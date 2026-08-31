import { useLocation, useNavigate } from 'react-router-dom'
import { getDomain } from '../domains'
import type { DomainId } from '../types'

interface ResultsState {
  results: { domainId: DomainId; score: number }[]
  source: 'weekly' | 'practice'
}

function encouragement(avg: number): string {
  if (avg >= 85) return 'Fantastiskt jobbat! Din hjärna var på topp idag.'
  if (avg >= 65) return 'Bra resultat! Fortsätt så här.'
  if (avg >= 40) return 'Helt okej. Träna vidare så förbättras det.'
  return 'Alla har svaga dagar. Kom ihåg att öva regelbundet.'
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResultsState | null

  if (!state || state.results.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-slate-400 mb-4">Inga resultat att visa.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-lg bg-sky-500 text-slate-950 font-semibold"
        >
          Till start
        </button>
      </div>
    )
  }

  const avg = Math.round(
    state.results.reduce((sum, r) => sum + r.score, 0) / state.results.length,
  )
  const weakest = [...state.results].sort((a, b) => a.score - b.score)[0]

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="text-sm text-slate-500 uppercase tracking-wide mb-2">
          {state.source === 'weekly' ? 'Veckotest klart' : 'Träningspass klart'}
        </div>
        <div className="text-6xl font-black text-sky-400">{avg}</div>
        <div className="text-slate-400 text-sm">genomsnittspoäng</div>
        <p className="mt-4 text-slate-300">{encouragement(avg)}</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {state.results.map((r) => {
          const domain = getDomain(r.domainId)
          return (
            <div
              key={r.domainId}
              className="flex items-center gap-4 bg-slate-900 rounded-xl px-4 py-3"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: domain.color }}
              />
              <div className="flex-1 text-slate-200 font-medium">{domain.name}</div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${r.score}%`, backgroundColor: domain.color }}
                />
              </div>
              <div className="w-10 text-right font-semibold tabular-nums">{r.score}</div>
            </div>
          )
        })}
      </div>

      {weakest && (
        <p className="text-slate-400 text-sm text-center">
          Ditt svagaste område just nu är <b style={{ color: getDomain(weakest.domainId).color }}>{getDomain(weakest.domainId).name}</b>{' '}
          — träna gärna extra på det.
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold"
        >
          Till start
        </button>
        <button
          onClick={() => navigate('/history')}
          className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 transition text-slate-950 font-semibold"
        >
          Se utveckling
        </button>
      </div>
    </div>
  )
}
