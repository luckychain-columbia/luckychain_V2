// Type definitions for lottery platform
// Based on old version structure with additions from new version

export interface LotteryData {
  creator: string
  title: string
  description: string
  ticketPrice: bigint
  maxTickets: bigint
  endTime: bigint
  isActive: boolean
  isCompleted: boolean
  winner: string
  totalPool: bigint
}

export interface LotteryConfig {
  numWinners: number
  creatorPct: number // basis points (0-10000)
  allowMultipleEntries: boolean
}

// Extended lottery interface with additional fields (for frontend use)
export interface Lottery {
  id?: number | string
  title: string
  description?: string
  entryFee: number // in ETH (converted from ticketPrice)
  ticketPrice: bigint // in wei
  endDateTime: number // unix timestamp
  endTime: bigint // unix timestamp (bigint)
  maxTickets: bigint
  maxEntrants?: number
  totalPlayers?: number
  creator: string
  isActive: boolean
  isCompleted: boolean
  ended?: boolean
  winner: string
  winners?: string[]
  totalPool: bigint
  participants?: string[]
  numWinners: number
  creatorFeePct: number // percentage (0-100)
  allowMultipleEntries: boolean
}

// User's lottery entries/tickets
export interface Ticket {
  id: string
  lotteryId: string
  lotteryTitle: string
  entryFee: string
  ticketCount: number // How many tickets the user has for this lottery
  prizePercentage?: number
  numberOfWinners?: number
  endDate: string
  totalEntrants: number
  status: "active" | "ended" | "won" | "lost"
  amountWon?: string // If user won
}

// Summary interface for efficient data retrieval (matches old version pattern)
export interface LotterySummary {
  id: bigint | number
  title: string
  entryFee: bigint
  ticketPrice: bigint
  endDateTime: bigint
  endTime: bigint
  maxTickets: bigint
  maxEntrants: bigint
  creator: string
  totalPlayers: bigint | number
  isActive: boolean
  isCompleted: boolean
  ended: boolean
  winner?: string
  totalPool?: bigint
  numWinners: number
  creatorPct: number
  allowMultipleEntries: boolean
}

