"use client"

import { useMemo } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../context/Web3Context"
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS, type LotteryData } from "@/lib/web3"
import { parseEther } from "../utils"
import { MOCK_LOTTERIES } from "./mock-data"

export type ContractLottery = LotteryData & {
  id: number
  participants?: string[]
  winners?: string[]
  numWinners?: number
  creatorPct?: number
  allowMultipleEntries?: boolean
}

// Contract service hook - matches old version structure
// Uses React hook pattern for better integration with React components
const useContract = () => {
  const { provider, account } = useWeb3()

  return useMemo(() => {
    const checkMetaMask = () => {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to use LuckyChain!")
        return false
      }
      return true
    }

    const getContractAddress = () => {
      const contractAddress = process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS || LOTTERY_CONTRACT_ADDRESS
      if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
        // Return mock data if contract not deployed
        return null
      }
      return contractAddress
    }

    const getContract = async (withSigner = false) => {
      if (!checkMetaMask()) {
        throw new Error("MetaMask not installed")
      }

      const contractAddress = getContractAddress()
      if (!contractAddress) {
        // Will use mock data fallback
        return null
      }

      if (!provider) {
        throw new Error("Provider not available. Please connect your wallet.")
      }

      // Check if contract is deployed
      const code = await provider.getCode(contractAddress)
      if (code === "0x") {
        console.warn(`No contract deployed at ${contractAddress}. Using mock data.`)
        return null
      }

      if (withSigner) {
        const signer = await provider.getSigner()
        return new ethers.Contract(contractAddress, LOTTERY_ABI, signer)
      }

      return new ethers.Contract(contractAddress, LOTTERY_ABI, provider)
    }

    const loadLotteries = async (): Promise<ContractLottery[]> => {
      try {
        if (!checkMetaMask()) {
          return MOCK_LOTTERIES
        }

        const contract = await getContract(false)
        if (!contract) {
          // Fallback to mock data
          return MOCK_LOTTERIES
        }

        const countBn = await contract.lotteryCount()
        const lotteryCount = Number(countBn)

        if (lotteryCount === 0) {
          return MOCK_LOTTERIES
        }

        const lotteries: ContractLottery[] = []

        try {
          const [infos, configs] = await contract.getLotteries(0, lotteryCount)

          for (let i = 0; i < infos.length; i++) {
            const info = infos[i]
            const config = configs?.[i]
            let winners: string[] = []
            try {
              winners = await contract.getWinners(i)
            } catch {
              winners = []
            }

            lotteries.push({
              ...info,
              id: i,
              numWinners: Number(config?.numWinners ?? 1),
              creatorPct: Number(config?.creatorPct ?? 0),
              allowMultipleEntries: Boolean(config?.allowMultipleEntries),
              winners,
            })
          }
        } catch (err) {
          console.warn("getLotteries failed, falling back to individual fetch", err)

          for (let i = 0; i < lotteryCount; i++) {
            try {
              const info = await contract.getLotteryInfo(i)
              let config
              try {
                config = await contract.getLotteryConfig(i)
              } catch {
                config = undefined
              }
              let winners: string[] = []
              try {
                winners = await contract.getWinners(i)
              } catch {
                winners = []
              }

              lotteries.push({
                ...info,
                id: i,
                numWinners: Number(config?.numWinners ?? 1),
                creatorPct: Number(config?.creatorPct ?? 0),
                allowMultipleEntries: Boolean(config?.allowMultipleEntries),
                winners,
              })
            } catch (error) {
              console.warn(`Failed to load lottery ${i}:`, error)
            }
          }
        }

        return lotteries.length > 0 ? lotteries : MOCK_LOTTERIES
      } catch (error) {
        console.error("Failed to load lotteries", error)
        // Fallback to mock data
        return MOCK_LOTTERIES
      }
    }

    const createLottery = async (params: {
      title: string
      description: string
      entryFee: string
      endDateTime: number
      numWinners: number
      creatorFeePct: number
      maxEntrants?: number | null
      allowMultipleEntries: boolean
    }) => {
      try {
        if (!checkMetaMask()) {
          throw new Error("Please install MetaMask to create lotteries")
        }

        if (!account) {
          throw new Error("Please connect your wallet to create lotteries")
        }

        const contract = await getContract(true)
        if (!contract) {
          throw new Error(
            "Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable."
          )
        }

        const creatorPctBasisPoints = Math.min(
          Math.max(Math.floor(params.creatorFeePct * 100), 0),
          10_000,
        )

        const maxTickets =
          params.maxEntrants && params.maxEntrants > 0 ? params.maxEntrants : 0

        const tx = await contract.createLottery(
          params.title,
          params.description,
          parseEther(params.entryFee),
          BigInt(params.endDateTime),
          params.numWinners,
          creatorPctBasisPoints,
          BigInt(maxTickets),
          params.allowMultipleEntries
        )

        const receipt = await tx.wait()

        // Extract lottery ID from event
        const event = receipt.logs.find((log: any) => {
          try {
            return contract.interface.parseLog(log)?.name === "LotteryCreated"
          } catch {
            return false
          }
        })

        if (event) {
          const parsed = contract.interface.parseLog(event)
          return parsed?.args[0].toString()
        }

        return null
      } catch (err: any) {
        console.error("Error creating lottery:", err)
        const message = err?.reason || err?.message || "Failed to create lottery"
        throw new Error(message)
      }
    }

    const buyTicket = async (
      lotteryId: number,
      ticketPriceEth: number,
      ticketCount: number = 1
    ) => {
      try {
        if (!checkMetaMask()) {
          throw new Error("Please install MetaMask to buy tickets")
        }

        if (!account) {
          throw new Error("Please connect your wallet to buy tickets")
        }

        if (ticketCount < 1) {
          throw new Error("Ticket count must be at least 1")
        }

        const contract = await getContract(true)
        if (!contract) {
          throw new Error(
            "Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable."
          )
        }

        const ticketPriceWei = parseEther(ticketPriceEth.toString())
        const totalValue = ticketPriceWei * BigInt(ticketCount)

        const tx = await contract.buyTickets(lotteryId, BigInt(ticketCount), {
          value: totalValue,
        })

        const receipt = await tx.wait()
        return receipt
      } catch (err: any) {
        console.error("Error buying ticket:", err)
        const message = err?.reason || err?.message || "Failed to buy ticket"
        throw new Error(message)
      }
    }

    const selectWinner = async (lotteryId: number) => {
      try {
        if (!checkMetaMask()) {
          throw new Error("Please install MetaMask to select winners")
        }

        if (!account) {
          throw new Error("Please connect your wallet to select winners")
        }

        const contract = await getContract(true)
        if (!contract) {
          throw new Error(
            "Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable."
          )
        }

        const tx = await contract.selectWinner(lotteryId)
        const receipt = await tx.wait()
        return receipt
      } catch (err: any) {
        console.error("Error selecting winner:", err)
        const message = err?.reason || err?.message || "Failed to select winner"
        throw new Error(message)
      }
    }

    const getTicketCount = async (lotteryId: number, userAddress?: string): Promise<number> => {
      try {
        if (!checkMetaMask()) {
          return 0
        }

        const address = userAddress || account
        if (!address) {
          return 0
        }

        const contract = await getContract(false)
        if (!contract) {
          return 0
        }

        const tickets = await contract.getUserTickets(lotteryId, address)
        return Array.isArray(tickets) ? tickets.length : 0
      } catch (error) {
        console.warn("Failed to get ticket count:", error)
        return 0
      }
    }

    const getParticipants = async (lotteryId: number): Promise<string[]> => {
      try {
        if (!checkMetaMask()) {
          const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
          return mockLottery?.participants || []
        }

        const contract = await getContract(false)
        if (!contract) {
          const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
          return mockLottery?.participants || []
        }

        return await contract.getParticipants(lotteryId)
      } catch (error) {
        console.warn("Failed to get participants:", error)
        const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mockLottery?.participants || []
      }
    }

    const getWinners = async (lotteryId: number): Promise<string[]> => {
      if (!checkMetaMask()) {
        const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mock?.winners || []
      }

      try {
        const contract = await getContract(false)
        if (!contract) {
          const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
          return mock?.winners || []
        }

        return await contract.getWinners(lotteryId)
      } catch (error) {
        console.warn("Failed to get winners:", error)
        const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mock?.winners || []
      }
    }

    return {
      loadLotteries,
      createLottery,
      buyTicket,
      selectWinner,
      getTicketCount,
      getParticipants,
      getWinners,
    }
  }, [provider, account])
}

export default useContract

