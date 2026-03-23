// Contract-related type definitions

/**
 * Memo from Buy Me a Coffee contract
 */
export interface Memo {
  supporter: string
  timestamp: bigint
  name: string
  message: string
}

/**
 * Warrior stats from Chain Battles contract
 * Maps to the Stats struct in the contract
 */
export interface WarriorStats {
  lastAction: bigint
  level: number
  power: number
  agility: number
  vitality: number
  victories: number
  defeats: number
  rarity: number
}

/**
 * Raw warrior stats as returned from the contract
 * (before conversion to numbers)
 */
export interface WarriorStatsRaw {
  lastAction: bigint
  level: bigint
  power: bigint
  agility: bigint
  vitality: bigint
  victories: bigint
  defeats: bigint
  rarity: bigint
}

