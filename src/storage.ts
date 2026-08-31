import type { Attempt, DifficultyTier, DomainId } from './types'

const STORAGE_KEY = 'brain-train:attempts'

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
  source: 'test' | 'practice',
): Attempt {
  const now = new Date()
  const attempt: Attempt = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    domainId,
    date: now.toISOString(),
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

export function getTestHistory(domainId: DomainId): { score: number; date: string }[] {
  return getAttempts()
    .filter((a) => a.domainId === domainId && a.source === 'test')
    .map((a) => ({ score: a.score, date: a.date }))
    .sort((a, b) => a.date.localeCompare(b.date))
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
