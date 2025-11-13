import { ethers } from "ethers"
import type { Raffle, RaffleData, RaffleSummary } from "../types"

// Format wallet address to show first 6 and last 4 characters
// Example: 0x1234...5678 instead of the full 42-character address
export const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Alias for consistency with old version
export const shortenAddress = formatAddress

// Format wei to ETH string
export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value)
}

// Parse ETH string to wei
export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value)
}

// Converts contract raffle data to frontend-friendly format
export function normalizeRaffle(
  raw: RaffleData | RaffleSummary | any,
  index?: number,
): Raffle {
  // Handle different input formats
  const id = index !== undefined ? index : Number(raw.id ?? 0)
  const title = raw.title || ""
  const description = raw.description || ""
  const ticketPrice = raw.ticketPrice ?? raw.entryFee ?? BigInt(0)
  const entryFee = Number(ethers.formatEther(ticketPrice))
  const endTime = raw.endTime ?? raw.endDateTime ?? BigInt(0)
  const endDateTime = Number(endTime)
  const maxTickets = raw.maxTickets ?? raw.maxEntrants ?? BigInt(0)
  const maxEntrants = Number(maxTickets)
  const creator = raw.creator || ""

  const endedFlag =
    raw.ended !== undefined ? Boolean(raw.ended) : undefined

  const isActive =
    raw.isActive !== undefined
      ? Boolean(raw.isActive)
      : endedFlag !== undefined
        ? !endedFlag
        : false

  const isCompleted =
    raw.isCompleted !== undefined
      ? Boolean(raw.isCompleted)
      : endedFlag !== undefined
        ? endedFlag
        : false
  const winner = raw.winner || "0x0000000000000000000000000000000000000000"
  const totalPool = raw.totalPool ?? BigInt(0)
  
  const numWinners =
    Number(
      raw.numWinners ??
        raw?.config?.numWinners ??
        (raw?.settings ? raw.settings.numWinners : undefined),
    ) || 1

  const creatorPctBasisPoints =
    Number(
      raw.creatorPct ??
        raw?.config?.creatorPct ??
        (raw?.settings ? raw.settings.creatorPct : undefined),
    ) || 0

  const allowMultipleEntries = Boolean(
    raw.allowMultipleEntries ??
      raw?.config?.allowMultipleEntries ??
      raw?.settings?.allowMultipleEntries,
  )

  const winners: string[] | undefined = Array.isArray(raw.winners)
    ? [...raw.winners]
    : undefined

  // Get total players from participants array or totalPlayers field
  let totalPlayers = 0
  if (raw.totalPlayers !== undefined) {
    totalPlayers = Number(raw.totalPlayers)
  } else if (raw.participants && Array.isArray(raw.participants)) {
    totalPlayers = raw.participants.length
  }

  return {
    id,
    title,
    description,
    entryFee,
    ticketPrice,
    endDateTime,
    endTime,
    maxTickets,
    maxEntrants,
    totalPlayers,
    creator,
    isActive,
    isCompleted,
    ended: isCompleted,
    winner,
    winners,
    totalPool,
    participants: raw.participants || [],
    numWinners,
    creatorFeePct: creatorPctBasisPoints / 100,
    allowMultipleEntries,
  }
}

// Calculate time remaining until raffle ends
export const getTimeRemaining = (endDate: number | bigint): string => {
  const endTimestamp = typeof endDate === "bigint" ? Number(endDate) : endDate
  const now = Math.floor(Date.now() / 1000)
  const diff = endTimestamp - now

  if (diff <= 0) return "Closed"

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  // Readable format
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return `${days}d ${remHours}h`
  }
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

// Calculate total prize pool for a raffle
export const calculatePrizePool = (
  entryFee: number,
  entrants: number,
  creatorFeePct: number = 0,
): string => {
  const total = entryFee * entrants
  const prize = total * ((100 - creatorFeePct) / 100)
  return prize.toFixed(4)
}

// Calculate win chance (simplified calculation)
// Note: This is a simplified version. Real calculation should account for number of winners
export const calculateWinChance = (
  ticketCount: number,
  totalEntrants: number,
  numberOfWinners: number = 1
): string => {
  if (totalEntrants === 0) return "0"
  // Simplified: (user tickets / total entries) * number of winners * 100
  const chance = (ticketCount / totalEntrants) * numberOfWinners * 100
  return Math.min(chance, 100).toFixed(2)
}

// Calculate total spent across all tickets
export const getTotalSpent = (tickets: Ticket[]): number => {
  return tickets.reduce((sum, ticket) => {
    return sum + parseFloat(ticket.entryFee) * ticket.ticketCount
  }, 0)
}

// Calculate total won across all tickets
export const getTotalWon = (tickets: Ticket[]): number => {
  return tickets.reduce((sum, ticket) => {
    return sum + (ticket.amountWon ? parseFloat(ticket.amountWon) : 0)
  }, 0)
}

// Type for Ticket (needed for utility functions)
interface Ticket {
  entryFee: string
  ticketCount: number
  amountWon?: string
}