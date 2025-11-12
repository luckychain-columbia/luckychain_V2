"use client"

import { useMemo } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../context/Web3Context"
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS, type LotteryData, formatEther } from "@/lib/web3"
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
    const isWeb3Available = () => typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    const getContractAddress = () => {
      const address = process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS || LOTTERY_CONTRACT_ADDRESS
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
          return new ethers.Contract(contractAddress, LOTTERY_ABI, signer)
        }
        return new ethers.Contract(contractAddress, LOTTERY_ABI, provider)
      } catch {
        return null
      }
    }

    const loadLotteries = async (): Promise<ContractLottery[]> => {
      try {
        const contract = await getContract(false)
        if (!contract) {
          return MOCK_LOTTERIES
        }

        const count = Number(await contract.lotteryCount())
        if (count === 0) {
          return MOCK_LOTTERIES
        }

        const lotteries: ContractLottery[] = []

        // Try batch fetch first (more efficient)
        try {
          const [infos, configs] = await contract.getLotteries(0, count)
          const winnerPromises = infos.map((_info: any, i: number) =>
            contract.getWinners(i).catch(() => [] as string[])
          )
          const winners = await Promise.all(winnerPromises)

          for (let i = 0; i < infos.length; i++) {
            const config = configs?.[i]
            lotteries.push({
              ...infos[i],
              id: i,
              numWinners: Number(config?.numWinners ?? 1),
              creatorPct: Number(config?.creatorPct ?? 0),
              allowMultipleEntries: Boolean(config?.allowMultipleEntries ?? false),
              winners: winners[i] || [],
            })
          }
        } catch {
          // Fallback to individual fetches if batch fails
          const promises = Array.from({ length: count }, async (_, i) => {
            try {
              const [info, config, winners] = await Promise.all([
                contract.getLotteryInfo(i),
                contract.getLotteryConfig(i).catch(() => null),
                contract.getWinners(i).catch(() => [] as string[]),
              ])

              return {
                ...info,
                id: i,
                numWinners: Number(config?.numWinners ?? 1),
                creatorPct: Number(config?.creatorPct ?? 0),
                allowMultipleEntries: Boolean(config?.allowMultipleEntries ?? false),
                winners: winners || [],
              }
            } catch (error) {
              console.warn(`Failed to load lottery ${i}:`, error)
              return null
            }
          })

          const results = await Promise.all(promises)
          lotteries.push(...results.filter((l): l is ContractLottery => l !== null))
        }

        return lotteries.length > 0 ? lotteries : MOCK_LOTTERIES
      } catch (error) {
        console.error("Failed to load lotteries:", error)
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
      if (!account) {
        throw new Error("Please connect your wallet to create lotteries")
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to create lotteries")
      }

      const contract = await getContract(true)
      if (!contract) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS.")
      }

      // Validate and normalize inputs
      if (!params.title?.trim()) {
        throw new Error("Lottery title is required")
      }
      if (Number(params.entryFee) <= 0) {
        throw new Error("Ticket price must be greater than 0")
      }
      if (params.numWinners < 1) {
        throw new Error("Number of winners must be at least 1")
      }
      if (params.endDateTime <= Math.floor(Date.now() / 1000)) {
        throw new Error("End date must be in the future")
      }

      const creatorPctBasisPoints = Math.min(Math.max(Math.floor(params.creatorFeePct * 100), 0), 10_000)
      const maxTickets = params.maxEntrants && params.maxEntrants > 0 ? BigInt(params.maxEntrants) : BigInt(0)

      try {
        const tx = await contract.createLottery(
          params.title.trim(),
          params.description?.trim() || params.title.trim(),
          parseEther(params.entryFee),
          BigInt(params.endDateTime),
          params.numWinners,
          creatorPctBasisPoints,
          maxTickets,
          params.allowMultipleEntries
        )

        const receipt = await tx.wait()
        if (!receipt) {
          throw new Error("Transaction receipt not found")
        }

        // Extract lottery ID from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log)
            return parsed?.name === "LotteryCreated"
          } catch {
            return false
          }
        })

        if (event) {
          const parsed = contract.interface.parseLog(event)
          return parsed?.args[0]?.toString()
        }

        throw new Error("Failed to extract lottery ID from transaction")
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
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS.")
      }

      try {
        const ticketPriceWei = parseEther(ticketPriceEth.toString())
        const totalValue = ticketPriceWei * BigInt(ticketCount)

        // Pre-check balance to provide better error message
        if (provider) {
          try {
            const balance = await provider.getBalance(account)
            if (balance < totalValue) {
              const balanceEth = Number(formatEther(balance))
              const requiredEth = ticketPriceEth * ticketCount
              throw new Error(
                `Insufficient balance. You have ${balanceEth.toFixed(4)} ETH, but need ${requiredEth.toFixed(4)} ETH`
              )
            }
          } catch (balanceError: any) {
            // If balance check fails, continue - contract will reject with better error
            console.warn("Balance check failed:", balanceError)
          }
        }

        const tx = await contract.buyTickets(lotteryId, BigInt(ticketCount), {
          value: totalValue,
        })

        const receipt = await tx.wait()
        if (!receipt) {
          throw new Error("Transaction receipt not found")
        }

        return receipt
      } catch (err: any) {
        console.error("Error buying ticket:", err)
        // Preserve custom error messages, otherwise extract from contract error
        if (err.message && err.message.includes("Insufficient balance")) {
          throw err
        }
        const message = err?.reason || err?.message || "Failed to buy ticket"
        throw new Error(message)
      }
    }

    const selectWinner = async (lotteryId: number) => {
      if (!account) {
        throw new Error("Please connect your wallet to select winners")
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to select winners")
      }

      const contract = await getContract(true)
      if (!contract) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS.")
      }

      try {
        const tx = await contract.selectWinner(lotteryId)
        const receipt = await tx.wait()
        if (!receipt) {
          throw new Error("Transaction receipt not found")
        }
        return receipt
      } catch (err: any) {
        console.error("Error selecting winner:", err)
        const message = err?.reason || err?.message || "Failed to select winner"
        throw new Error(message)
      }
    }

    const getTicketCount = async (lotteryId: number, userAddress?: string): Promise<number> => {
      const address = userAddress || account
      if (!address) {
        return 0
      }

      const contract = await getContract(false)
      if (!contract) {
        return 0
      }

      try {
        const tickets = await contract.getUserTickets(lotteryId, address)
        return Array.isArray(tickets) ? tickets.length : 0
      } catch {
        return 0
      }
    }

    const getParticipants = async (lotteryId: number): Promise<string[]> => {
      const contract = await getContract(false)
      if (!contract) {
        const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mock?.participants || []
      }

      try {
        return await contract.getParticipants(lotteryId)
      } catch {
        const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mock?.participants || []
      }
    }

    const getWinners = async (lotteryId: number): Promise<string[]> => {
      const contract = await getContract(false)
      if (!contract) {
        const mock = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
        return mock?.winners || []
      }

      try {
        return await contract.getWinners(lotteryId)
      } catch {
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

