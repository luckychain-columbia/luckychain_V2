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
