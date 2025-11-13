"use client"

import { useMemo } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../context/Web3Context"
import { RAFFLE_ABI } from "@/lib/contract-abi"
import { RAFFLE_CONTRACT_ADDRESS, type RaffleData, formatEther } from "@/lib/web3"
import { parseEther } from "../utils"
import { MOCK_RAFFLES } from "./mock-data"
import { contractCache, cacheKeys } from "@/lib/contract-cache"

export type ContractRaffle = RaffleData & {
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
    const isWeb3Available = () => typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    const getContractAddress = () => {
      const address = process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || RAFFLE_CONTRACT_ADDRESS
      return address && address !== "0x0000000000000000000000000000000000000000" ? address : null
    }

    const getContract = async (withSigner = false) => {
      if (!isWeb3Available()) {
        return null
      }

      const contractAddress = getContractAddress()
      if (!contractAddress || !provider) {
        return null
      }

      try {
        const code = await provider.getCode(contractAddress)
        if (code === "0x") {
          return null
        }

        if (withSigner) {
          const signer = await provider.getSigner()
          return new ethers.Contract(contractAddress, RAFFLE_ABI, signer)
        }
        return new ethers.Contract(contractAddress, RAFFLE_ABI, provider)
      } catch {
        return null
      }
    }

    const loadRaffles = async (): Promise<ContractRaffle[]> => {
      try {
        const contract = await getContract(false)
        if (!contract) {
          return MOCK_RAFFLES
        }

        // Check cache first
        const cacheKey = cacheKeys.rafflesList()
        const cached = contractCache.get<ContractRaffle[]>(cacheKey)
        if (cached) {
          return cached
        }

        // Get raffle count (with caching)
        const count = await contractCache.getOrFetch(
          cacheKeys.raffleCount(),
          async () => Number(await contract.raffleCount()),
          30000 // Cache count for 30 seconds
        )

        if (count === 0) {
          return MOCK_RAFFLES
        }

        const raffles: ContractRaffle[] = []

        // Try batch fetch first (more efficient)
        try {
          const [infos, configs] = await contract.getRaffles(0, count)
          const winnerPromises = infos.map(async (_info: any, i: number) => {
            // Check cache for winners
            const winnersKey = cacheKeys.raffleWinners(i)
            return contractCache.getOrFetch(
              winnersKey,
              async () => {
                try {
                  return await contract.getWinners(i)
                } catch {
                  return [] as string[]
                }
              },
              infos[i].isCompleted ? Infinity : contractCache.getRaffleTTL(infos[i].isCompleted)
            )
          })
          const winners = await Promise.all(winnerPromises)

          for (let i = 0; i < infos.length; i++) {
            const config = configs?.[i]
            const raffleData = {
              ...infos[i],
              id: i,
              numWinners: Number(config?.numWinners ?? 1),
              creatorPct: Number(config?.creatorPct ?? 0),
              allowMultipleEntries: Boolean(config?.allowMultipleEntries ?? false),
              winners: winners[i] || [],
            }
            raffles.push(raffleData)

            // Cache individual raffle info
            const raffleInfoKey = cacheKeys.raffleInfo(i)
            contractCache.set(
              raffleInfoKey,
              raffleData,
              contractCache.getRaffleTTL(infos[i].isCompleted)
            )
          }
        } catch {
          // Fallback to individual fetches if batch fails
          const promises = Array.from({ length: count }, async (_, i) => {
            try {
              // Check cache for individual raffle
              const raffleInfoKey = cacheKeys.raffleInfo(i)
              const cachedRaffle = contractCache.get<ContractRaffle>(raffleInfoKey)
              if (cachedRaffle) {
                return cachedRaffle
              }

              // Fetch info first to determine if completed
              const info = await contract.getRaffleInfo(i)
              const isCompleted = info.isCompleted ?? false

              const [config, winners] = await Promise.all([
                contract.getRaffleConfig(i).catch(() => null),
                contractCache.getOrFetch(
                  cacheKeys.raffleWinners(i),
                  async () => {
                    try {
                      return await contract.getWinners(i)
                    } catch {
                      return [] as string[]
                    }
                  },
                  isCompleted ? Infinity : contractCache.getRaffleTTL(isCompleted)
                ),
              ])

              const raffleData = {
                ...info,
                id: i,
                numWinners: Number(config?.numWinners ?? 1),
                creatorPct: Number(config?.creatorPct ?? 0),
                allowMultipleEntries: Boolean(config?.allowMultipleEntries ?? false),
                winners: winners || [],
              }

              // Cache the raffle data
              contractCache.set(
                raffleInfoKey,
                raffleData,
                contractCache.getRaffleTTL(isCompleted)
              )

              return raffleData
            } catch (error) {
              console.warn(`Failed to load raffle ${i}:`, error)
              return null
            }
          })

          const results = await Promise.all(promises)
          raffles.push(...results.filter((l): l is ContractRaffle => l !== null))
        }

        const result = raffles.length > 0 ? raffles : MOCK_RAFFLES

        // Cache the entire list
        contractCache.set(cacheKey, result, 10000) // Cache list for 10 seconds

        return result
      } catch (error) {
        console.error("Failed to load raffles:", error)
        return MOCK_RAFFLES
      }
    }

    const createRaffle = async (params: {
      title: string
      description: string
      entryFee: string
      endDateTime: number
      numWinners: number
      creatorFeePct: number
      maxEntrants?: number | null
      allowMultipleEntries: boolean
    }) => {
      if (!account) {
        throw new Error("Please connect your wallet to create raffles")
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to create raffles")
      }

      const contract = await getContract(true)
      if (!contract) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS.")
      }

      // Validate and normalize inputs
      if (!params.title?.trim()) {
        throw new Error("Raffle title is required")
      }
      if (params.title.trim().length > 100) {
        throw new Error("Raffle title cannot exceed 100 characters")
      }
      const entryFeeNum = Number(params.entryFee)
      if (isNaN(entryFeeNum) || entryFeeNum <= 0 || !Number.isFinite(entryFeeNum)) {
        throw new Error("Ticket price must be a valid number greater than 0")
      }
      if (entryFeeNum > 1000) {
        throw new Error("Ticket price cannot exceed 1000 ETH")
      }
      if (params.numWinners < 1 || params.numWinners > 100 || !Number.isInteger(params.numWinners)) {
        throw new Error("Number of winners must be an integer between 1 and 100")
      }
      const nowSeconds = Math.floor(Date.now() / 1000)
      if (params.endDateTime <= nowSeconds) {
        throw new Error("End date must be in the future")
      }
      // Validate end date is not too far in the future (prevent overflow issues)
      const maxEndTime = nowSeconds + (365 * 24 * 60 * 60) // 1 year from now
      if (params.endDateTime > maxEndTime) {
        throw new Error("End date cannot be more than 1 year in the future")
      }
      if (params.maxEntrants !== null && params.maxEntrants !== undefined) {
        if (params.maxEntrants < params.numWinners) {
          throw new Error(`Max entrants (${params.maxEntrants}) cannot be less than number of winners (${params.numWinners})`)
        }
        if (params.maxEntrants > 10000) {
          throw new Error("Max entrants cannot exceed 10,000")
        }
      }

      const creatorPctBasisPoints = Math.min(Math.max(Math.floor(params.creatorFeePct * 100), 0), 10_000)
      const maxTickets = params.maxEntrants && params.maxEntrants > 0 ? BigInt(params.maxEntrants) : BigInt(0)

      try {
        // Validate entry fee can be parsed to wei
        let entryFeeWei: bigint
        try {
          entryFeeWei = parseEther(params.entryFee)
          if (entryFeeWei <= BigInt(0)) {
            throw new Error("Entry fee must be greater than 0")
          }
        } catch (parseError: any) {
          throw new Error(`Invalid entry fee: ${parseError.message || "Cannot parse to wei"}`)
        }
        
        const tx = await contract.createRaffle(
          params.title.trim(),
          params.description?.trim() || params.title.trim(),
          entryFeeWei,
          BigInt(params.endDateTime),
          params.numWinners,
          creatorPctBasisPoints,
          maxTickets,
          params.allowMultipleEntries
        )

        // Wait for transaction with timeout (5 minutes)
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction timeout - please check your wallet")), 5 * 60 * 1000)
          )
        ]) as any
        
        if (!receipt || !receipt.status) {
          throw new Error("Transaction failed or was reverted")
        }

        // Extract raffle ID from event
        const event = receipt.logs?.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log)
            return parsed?.name === "RaffleCreated"
          } catch {
            return false
          }
        })

        if (event) {
          try {
            const parsed = contract.interface.parseLog(event)
            const raffleId = parsed?.args?.[0]?.toString()
            if (raffleId !== undefined) {
              return raffleId
            }
          } catch (parseError) {
            console.warn("Failed to parse RaffleCreated event:", parseError)
          }
        }

        // Fallback: try to get raffle count and use that as ID
        try {
          const count = await contract.raffleCount()
          const raffleId = (Number(count) - 1).toString()
          
          // Invalidate cache after creating new raffle
          contractCache.invalidate(cacheKeys.rafflesList())
          contractCache.invalidate(cacheKeys.raffleCount())
          
          return raffleId
        } catch {
          throw new Error("Failed to extract raffle ID from transaction")
        }
      } catch (err: any) {
        console.error("Error creating raffle:", err)
        
        // Handle user rejection
        if (err?.code === 4001 || err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
          throw new Error("Transaction was rejected by user")
        }
        
        // Handle transaction timeout
        if (err?.message?.includes("timeout")) {
          throw err
        }
        
        // Handle invalid entry fee
        if (err?.message?.includes("Invalid entry fee")) {
          throw err
        }
        
        // Handle contract revert with reason
        if (err?.reason) {
          throw new Error(err.reason)
        }
        
        // Extract error message
        const message = err?.message || "Failed to create raffle"
        throw new Error(message)
      }
    }

    const buyTicket = async (
      raffleId: number,
      ticketPriceEth: number,
      ticketCount: number = 1
    ) => {
      if (!account) {
        throw new Error("Please connect your wallet to buy tickets")
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to buy tickets")
      }

      if (ticketCount < 1 || !Number.isInteger(ticketCount)) {
        throw new Error("Ticket count must be a positive integer")
      }

      if (ticketPriceEth <= 0) {
        throw new Error("Invalid ticket price")
      }

      const contract = await getContract(true)
      if (!contract) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS.")
      }

      try {
        // Validate ticket price can be parsed to wei
        let ticketPriceWei: bigint
        try {
          ticketPriceWei = parseEther(ticketPriceEth.toString())
          if (ticketPriceWei <= BigInt(0)) {
            throw new Error("Ticket price must be greater than 0")
          }
        } catch (parseError: any) {
          throw new Error(`Invalid ticket price: ${parseError.message || "Cannot parse to wei"}`)
        }
        
        // Validate ticket count
        if (ticketCount < 1 || ticketCount > 10000) {
          throw new Error("Ticket count must be between 1 and 10,000")
        }
        if (!Number.isInteger(ticketCount)) {
          throw new Error("Ticket count must be an integer")
        }
        
        // Check for overflow in total value calculation
        const ticketCountBigInt = BigInt(ticketCount)
        const totalValue = ticketPriceWei * ticketCountBigInt
        // Check for overflow: if multiplying causes overflow, result will be smaller than one of the operands
        if (ticketCountBigInt > BigInt(0) && totalValue / ticketCountBigInt !== ticketPriceWei) {
          throw new Error("Ticket count too large - would cause overflow")
        }
        if (totalValue <= BigInt(0)) {
          throw new Error("Invalid total value - would be zero or negative")
        }

        // Pre-check balance to provide better error message
        if (provider) {
          try {
            const balance = await provider.getBalance(account)
            // Estimate gas cost (rough estimate: 100,000 gas * 20 gwei = 0.002 ETH)
            // This is a conservative estimate - actual gas may vary
            const estimatedGasCost = ethers.parseEther("0.002") // 0.002 ETH for gas
            const totalRequired = totalValue + estimatedGasCost
            
            if (balance < totalValue) {
              const balanceEth = Number(formatEther(balance))
              const requiredEth = ticketPriceEth * ticketCount
              throw new Error(
                `Insufficient balance. You have ${balanceEth.toFixed(4)} ETH, but need ${requiredEth.toFixed(4)} ETH for tickets`
              )
            }
            
            // Warn if balance is close to required amount (might not have enough for gas)
            if (balance < totalRequired && balance >= totalValue) {
              const balanceEth = Number(formatEther(balance))
              const requiredEth = ticketPriceEth * ticketCount
              console.warn(
                `Warning: Balance (${balanceEth.toFixed(4)} ETH) may not cover gas fees. Required: ${requiredEth.toFixed(4)} ETH + gas`
              )
              // Don't throw error - let transaction attempt, contract will reject if insufficient
            }
          } catch (balanceError: any) {
            // If balance check fails, continue - contract will reject with better error
            if (balanceError.message && balanceError.message.includes("Insufficient balance")) {
              throw balanceError
            }
            console.warn("Balance check failed:", balanceError)
          }
        }

        const tx = await contract.buyTickets(raffleId, BigInt(ticketCount), {
          value: totalValue,
        })

        // Wait for transaction with timeout (5 minutes)
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction timeout - please check your wallet")), 5 * 60 * 1000)
          )
        ]) as any
        
        if (!receipt || !receipt.status) {
          throw new Error("Transaction failed or was reverted")
        }

        // Invalidate cache after buying ticket
        contractCache.invalidateRaffle(raffleId)
        contractCache.invalidate(cacheKeys.raffleParticipants(raffleId))
        contractCache.invalidate(cacheKeys.userTickets(raffleId, account))

        return receipt
      } catch (err: any) {
        console.error("Error buying ticket:", err)
        
        // Handle user rejection
        if (err?.code === 4001 || err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
          throw new Error("Transaction was rejected by user")
        }
        
        // Handle transaction timeout
        if (err?.message?.includes("timeout")) {
          throw err
        }
        
        // Handle insufficient balance
        if (err?.message?.includes("Insufficient balance") || err?.code === "INSUFFICIENT_FUNDS") {
          throw err
        }
        
        // Handle contract revert
        if (err?.reason) {
          throw new Error(err.reason)
        }
        
        // Extract error message
        const message = err?.message || "Failed to buy ticket"
        throw new Error(message)
      }
    }

    const selectWinner = async (raffleId: number) => {
      if (!account) {
        throw new Error("Please connect your wallet to select winners")
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to select winners")
      }

      const contract = await getContract(true)
      if (!contract) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS.")
      }

      try {
        const tx = await contract.selectWinner(raffleId)
        
        // Wait for transaction with timeout (5 minutes)
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction timeout - please check your wallet")), 5 * 60 * 1000)
          )
        ]) as any
        
        if (!receipt || !receipt.status) {
          throw new Error("Transaction failed or was reverted")
        }

        // Invalidate cache after finalizing raffle
        contractCache.invalidateRaffle(raffleId)
        contractCache.invalidate(cacheKeys.raffleWinners(raffleId))
        contractCache.invalidate(cacheKeys.rafflesList()) // Invalidate list since status changed
        
        return receipt
      } catch (err: any) {
        console.error("Error selecting winner:", err)
        
        // Handle user rejection
        if (err?.code === 4001 || err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
          throw new Error("Transaction was rejected by user")
        }
        
        // Handle transaction timeout
        if (err?.message?.includes("timeout")) {
          throw err
        }
        
        // Handle contract revert with reason
        if (err?.reason) {
          throw new Error(err.reason)
        }
        
        // Extract error message
        const message = err?.message || "Failed to select winner"
        throw new Error(message)
      }
    }

    const getTicketCount = async (raffleId: number, userAddress?: string): Promise<number> => {
      const address = userAddress || account
      if (!address) {
        return 0
      }

      const contract = await getContract(false)
      if (!contract) {
        return 0
      }

      try {
        const tickets = await contract.getUserTickets(raffleId, address)
        return Array.isArray(tickets) ? tickets.length : 0
      } catch {
        return 0
      }
    }

    const getParticipants = async (raffleId: number): Promise<string[]> => {
      const contract = await getContract(false)
      if (!contract) {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
        return mock?.participants || []
      }

      // Check cache first
      const cacheKey = cacheKeys.raffleParticipants(raffleId)
      
      try {
        return await contractCache.getOrFetch(
          cacheKey,
          async () => {
            try {
              return await contract.getParticipants(raffleId)
            } catch {
              const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
              return mock?.participants || []
            }
          },
          contractCache.getParticipantsTTL() // Participants change frequently
        )
      } catch {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
        return mock?.participants || []
      }
    }

    const getWinners = async (raffleId: number): Promise<string[]> => {
      const contract = await getContract(false)
      if (!contract) {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
        return mock?.winners || []
      }

      // Check cache first
      const cacheKey = cacheKeys.raffleWinners(raffleId)
      
      try {
        // Try to get raffle info from cache to determine if completed
        const raffleInfoKey = cacheKeys.raffleInfo(raffleId)
        const cachedRaffle = contractCache.get<ContractRaffle>(raffleInfoKey)
        const isCompleted = cachedRaffle?.isCompleted ?? false

        return await contractCache.getOrFetch(
          cacheKey,
          async () => {
            try {
              return await contract.getWinners(raffleId)
            } catch {
              const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
              return mock?.winners || []
            }
          },
          isCompleted ? Infinity : contractCache.getRaffleTTL(isCompleted)
        )
      } catch {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId)
        return mock?.winners || []
      }
    }

    return {
      loadRaffles,
      createRaffle,
      buyTicket,
      selectWinner,
      getTicketCount,
      getParticipants,
      getWinners,
    }
  }, [provider, account])
}

export default useContract

