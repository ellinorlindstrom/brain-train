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
  score: number // 0-100
  source: 'test' | 'practice'
}

export type DifficultyTier = 1 | 2 | 3

export interface GameProps {
  difficulty: DifficultyTier
  onComplete: (score: number) => void
}
