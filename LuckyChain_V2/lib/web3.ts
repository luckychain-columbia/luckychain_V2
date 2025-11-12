"use client"

import { ethers } from "ethers"
import { useEffect, useState } from "react"

// Contract ABI (simplified for demo)
export const LOTTERY_ABI = [
  "function createLottery(string _title, string _description, uint256 _ticketPrice, uint256 _endDateTime, uint8 _numWinners, uint16 _creatorPct, uint256 _maxTickets, bool _allowMultipleEntries) external returns (uint256)",
  "function buyTicket(uint256 _lotteryId) external payable",
  "function buyTickets(uint256 _lotteryId, uint256 _ticketCount) external payable",
  "function selectWinner(uint256 _lotteryId) external",
  "function endLottery(uint256 _lotteryId) external",
  "function getLotteryInfo(uint256 _lotteryId) external view returns (tuple(address creator, string title, string description, uint256 ticketPrice, uint256 maxTickets, uint256 endTime, bool isActive, bool isCompleted, address winner, uint256 totalPool))",
  "function getLotteryConfig(uint256 _lotteryId) external view returns (tuple(uint8 numWinners, uint16 creatorPct, bool allowMultipleEntries))",
  "function getParticipants(uint256 _lotteryId) external view returns (address[] memory)",
  "function getUserTickets(uint256 _lotteryId, address _user) external view returns (uint256[] memory)",
  "function getWinners(uint256 _lotteryId) external view returns (address[] memory)",
  "function getLotteries(uint256 start, uint256 count) external view returns (tuple(address creator, string title, string description, uint256 ticketPrice, uint256 maxTickets, uint256 endTime, bool isActive, bool isCompleted, address winner, uint256 totalPool)[], tuple(uint8 numWinners, uint16 creatorPct, bool allowMultipleEntries)[])",
  "function lotteryCount() external view returns (uint256)",
  "event LotteryCreated(uint256 indexed lotteryId, address indexed creator, string title, uint256 ticketPrice, uint256 maxTickets, uint256 endTime, uint8 numWinners, uint16 creatorPct, bool allowMultipleEntries)",
  "event TicketsPurchased(uint256 indexed lotteryId, address indexed participant, uint256[] ticketNumbers, uint256 amountPaid)",
  "event WinnersSelected(uint256 indexed lotteryId, address[] winners, uint256 prizePerWinner, uint256 creatorReward)",
]

// For demo purposes - in production, deploy to testnet/mainnet
export const LOTTERY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

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

export function isWeb3Available(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

export function isContractDeployed(): boolean {
  return LOTTERY_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"
}

export async function getProvider() {
  if (isWeb3Available()) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error("No Ethereum provider found")
}

export async function getSigner() {
  const provider = await getProvider()
  return await provider.getSigner()
}

export async function getContract() {
  const signer = await getSigner()
  return new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, signer)
}

export async function connectWallet() {
  try {
    const provider = await getProvider()
    const accounts = await provider.send("eth_requestAccounts", [])
    return accounts[0]
  } catch (error) {
    console.error("Error connecting wallet:", error)
    throw error
  }
}

export async function getAccount() {
  try {
    if (!isWeb3Available()) {
      return null
    }
    const provider = await getProvider()
    const accounts = await provider.send("eth_accounts", [])
    return accounts[0] || null
  } catch (error) {
    return null
  }
}

export function formatEther(value: bigint): string {
  return ethers.formatEther(value)
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value)
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useAccount() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function checkAccount() {
      const account = await getAccount()
      setAddress(account)
    }

    checkAccount()

    // Listen for account changes
    if (isWeb3Available() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAddress(accounts[0] || null)
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  return { address }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
