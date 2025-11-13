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

/**
 * Get the base path for the application (for GitHub Pages deployment)
 * Extracts base path from current location by checking the pathname
 * 
 * For GitHub Pages: https://luckychain-columbia.github.io/luckychain_V2/raffle/4
 * - pathname will be: /luckychain_V2/raffle/4
 * - base path should be: /luckychain_V2
 * 
 * For local development: http://localhost:3000/raffle/4
 * - pathname will be: /raffle/4
 * - base path should be: "" (empty)
 */
export const getBasePath = (): string => {
  if (typeof window === "undefined") return ""
  
  // Get the current pathname (e.g., "/luckychain_V2/raffle/4" or "/raffle/4")
  const pathname = window.location.pathname
  
  // Extract segments from pathname (e.g., "/luckychain_V2/raffle/4" -> ["luckychain_V2", "raffle", "4"])
  const segments = pathname.split("/").filter(Boolean)
  
  // Check if we're on GitHub Pages by checking if the first segment matches the repo name
  // This works because Next.js sets basePath in production to /luckychain_V2
  // So any URL on GitHub Pages will have /luckychain_V2 as the first segment
  if (segments.length > 0 && segments[0] === "luckychain_V2") {
    return "/luckychain_V2"
  }
  
  // Additional check: if pathname explicitly starts with /luckychain_V2
  if (pathname.startsWith("/luckychain_V2")) {
    return "/luckychain_V2"
  }
  
  // In development (localhost) or if deployed to root domain, return empty string
  return ""
}

/**
 * Get the full URL for a raffle, including base path if on GitHub Pages
 */
export const getRaffleUrl = (raffleId: number | string): string => {
  if (typeof window === "undefined") return ""
  
  const basePath = getBasePath()
  const baseUrl = window.location.origin
  const rafflePath = `/raffle/${raffleId}`
  
  return `${baseUrl}${basePath}${rafflePath}`
}
