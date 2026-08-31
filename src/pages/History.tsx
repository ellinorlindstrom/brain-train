import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DOMAINS, getDomain } from '../domains'
import { getWeeklyHistory } from '../storage'
import type { DomainId } from '../types'

export default function History() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<DomainId>('memory')

  const history = useMemo(() => getWeeklyHistory(selected), [selected])
  const domain = getDomain(selected)

  const chartData = history.map((h) => ({ week: h.weekKey.slice(6), score: h.score }))

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Din utveckling</h1>
        <button
          onClick={() => navigate('/')}
          className="text-sky-400 hover:text-sky-300 text-sm font-medium"
        >
          ← Till start
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition border"
            style={
              selected === d.id
                ? { backgroundColor: d.color, borderColor: d.color, color: '#0f172a' }
                : { borderColor: '#334155', color: '#cbd5e1' }
            }
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-6">
        <h2 className="font-semibold mb-4" style={{ color: domain.color }}>
          {domain.name} — poäng per veckotest
        </h2>
        {chartData.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center">
            Inga veckotest genomförda ännu för det här området.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={domain.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-sm text-slate-500 uppercase tracking-wide mb-3">
            Alla veckotest
          </h2>
          <div className="flex flex-col gap-2">
            {[...history].reverse().map((h) => (
              <div
                key={h.weekKey}
                className="flex justify-between text-sm py-1.5 border-b border-slate-800 last:border-0"
              >
                <span className="text-slate-400">
                  Vecka {h.weekKey} · {new Date(h.date).toLocaleDateString('sv-SE')}
                </span>
                <span className="font-semibold">{h.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
