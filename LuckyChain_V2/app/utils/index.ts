/**
 * Utility functions for the raffle platform
 * Consolidated to remove unused functions and redundancies
 */

import { ethers } from "ethers"

/**
 * Format wallet address to show first 6 and last 4 characters
 * Example: 0x1234...5678 instead of the full 42-character address
 */
export const shortenAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format wei to ETH string
 */
export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value)
}

/**
 * Parse ETH string to wei
 */
export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value)
}

/**
 * Calculate time remaining until raffle ends
 */
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
