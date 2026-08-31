import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { DOMAINS } from '../domains'
import { getDomainsTestedThisWeek, getLatestScoreByDomain } from '../storage'
import type { DomainId } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()

  const latestScores = useMemo(() => {
    const map = new Map<DomainId, number | null>()
    for (const d of DOMAINS) map.set(d.id, getLatestScoreByDomain(d.id))
    return map
  }, [])

  const testedThisWeek = useMemo(() => getDomainsTestedThisWeek(), [])
  const missingThisWeek = DOMAINS.filter((d) => !testedThisWeek.has(d.id))
  const weeklyDone = missingThisWeek.length === 0

  const scoresWithData = DOMAINS.filter((d) => latestScores.get(d.id) !== null)
  const overall =
    scoresWithData.length > 0
      ? Math.round(
          scoresWithData.reduce((sum, d) => sum + (latestScores.get(d.id) ?? 0), 0) /
            scoresWithData.length,
        )
      : null

  const radarData = DOMAINS.map((d) => ({
    name: d.name,
    score: latestScores.get(d.id) ?? 0,
  }))

  function startWeeklyTest() {
    const domainIds = (missingThisWeek.length > 0 ? missingThisWeek : DOMAINS).map((d) => d.id)
    navigate('/test', { state: { domainIds, source: 'weekly' } })
  }

  function practiceDomain(id: DomainId) {
    navigate('/test', { state: { domainIds: [id], source: 'practice' } })
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col gap-8">
      <header className="text-center">
        <h1 className="text-3xl font-black">Hjärnträning</h1>
        <p className="text-slate-400 mt-1">Testa dig varje vecka och se hur du utvecklas</p>
      </header>

      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center sm:text-left flex-1">
          <div className="text-sm text-slate-500 uppercase tracking-wide">Veckans status</div>
          {weeklyDone ? (
            <p className="text-emerald-400 font-semibold mt-1">
              Du har gjort veckans test på alla områden! 🎉
            </p>
          ) : (
            <p className="text-slate-200 mt-1">
              {testedThisWeek.size} av {DOMAINS.length} områden testade denna vecka.
            </p>
          )}
          {overall !== null && (
            <div className="text-slate-400 text-sm mt-2">
              Hjärnindex just nu: <span className="text-sky-400 font-bold">{overall}</span>
              <span className="text-slate-600"> (eget mått, inte ett kliniskt IQ-test)</span>
            </div>
          )}
        </div>
        <button
          onClick={startWeeklyTest}
          className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition text-slate-950 font-semibold whitespace-nowrap"
        >
          {weeklyDone ? 'Gör om veckotestet' : 'Kör veckotest'}
        </button>
      </div>

      {overall !== null && (
        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-sm text-slate-500 uppercase tracking-wide mb-4 text-center">
            Din profil
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 13 }} />
              <Radar
                dataKey="score"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.4}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <h2 className="text-sm text-slate-500 uppercase tracking-wide mb-3">
          Träna ett enskilt område
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {DOMAINS.map((d) => {
            const score = latestScores.get(d.id)
            return (
              <div key={d.id} className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-950 shrink-0"
                  style={{ backgroundColor: d.color }}
                >
                  {score ?? '–'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.description}</div>
                </div>
                <button
                  onClick={() => practiceDomain(d.id)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
                >
                  Träna
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => navigate('/history')}
        className="text-sky-400 hover:text-sky-300 text-sm font-medium self-center"
      >
        Se din utveckling över tid →
      </button>
    </div>
  )
}
