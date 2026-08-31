export type DomainId =
  | 'memory'
  | 'attention'
  | 'speed'
  | 'logic'
  | 'flexibility'
  | 'verbal'

export interface Attempt {
  id: string
  domainId: DomainId
  date: string // ISO timestamp
  weekKey: string // e.g. "2026-W35"
  score: number // 0-100
  source: 'weekly' | 'practice'
}

export type DifficultyTier = 1 | 2 | 3

export interface GameProps {
  difficulty: DifficultyTier
  onComplete: (score: number) => void
}
