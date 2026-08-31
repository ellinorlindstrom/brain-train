import type { Attempt, DifficultyTier, DomainId } from './types'

const STORAGE_KEY = 'brain-train:attempts'

export function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function currentWeekKey(): string {
  return getIsoWeekKey(new Date())
}

export function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Attempt[]
  } catch {
    return []
  }
}

function saveAttempts(attempts: Attempt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
}

export function addAttempt(
  domainId: DomainId,
  score: number,
  source: 'weekly' | 'practice',
): Attempt {
  const now = new Date()
  const attempt: Attempt = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    domainId,
    date: now.toISOString(),
    weekKey: getIsoWeekKey(now),
    score: Math.round(score),
    source,
  }
  const attempts = getAttempts()
  attempts.push(attempt)
  saveAttempts(attempts)
  return attempt
}

export function getLatestScoreByDomain(domainId: DomainId): number | null {
  const attempts = getAttempts()
    .filter((a) => a.domainId === domainId)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (attempts.length === 0) return null
  return attempts[attempts.length - 1].score
}

export function getDomainsTestedThisWeek(): Set<DomainId> {
  const week = currentWeekKey()
  const tested = new Set<DomainId>()
  for (const a of getAttempts()) {
    if (a.weekKey === week && a.source === 'weekly') tested.add(a.domainId)
  }
  return tested
}

export function getWeeklyHistory(domainId: DomainId): { weekKey: string; score: number; date: string }[] {
  const byWeek = new Map<string, { score: number; date: string }>()
  for (const a of getAttempts().filter((a) => a.domainId === domainId && a.source === 'weekly')) {
    const existing = byWeek.get(a.weekKey)
    if (!existing || a.date > existing.date) {
      byWeek.set(a.weekKey, { score: a.score, date: a.date })
    }
  }
  return Array.from(byWeek.entries())
    .map(([weekKey, v]) => ({ weekKey, ...v }))
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
}

export function getDifficultyTier(domainId: DomainId): DifficultyTier {
  const recent = getAttempts()
    .filter((a) => a.domainId === domainId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
  if (recent.length === 0) return 1
  const avg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length
  if (avg >= 80) return 3
  if (avg >= 55) return 2
  return 1
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY)
}
