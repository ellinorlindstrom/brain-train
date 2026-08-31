import type { ComponentType } from 'react'
import type { DomainId, GameProps } from '../types'
import MemoryGame from './MemoryGame'
import AttentionGame from './AttentionGame'
import SpeedGame from './SpeedGame'
import LogicGame from './LogicGame'
import FlexibilityGame from './FlexibilityGame'
import VerbalGame from './VerbalGame'

export const GAME_COMPONENTS: Record<DomainId, ComponentType<GameProps>> = {
  memory: MemoryGame,
  attention: AttentionGame,
  speed: SpeedGame,
  logic: LogicGame,
  flexibility: FlexibilityGame,
  verbal: VerbalGame,
}
