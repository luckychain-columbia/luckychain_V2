"use client"

import { ethers } from "ethers"

// Contract address - set via environment variable or use default
export const RAFFLE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

// Check if Web3 is available (EIP-1193 provider)
export function isWeb3Available(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// Check if contract is deployed at the given address
export async function isContractDeployed(
  address: string,
  provider: ethers.Provider
): Promise<boolean> {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return false
  }
  try {
    const code = await provider.getCode(address)
    return code !== "0x" && code !== "0x0"
  } catch {
    return false
  }
}
