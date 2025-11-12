import { getContract, type LotteryData, parseEther, isWeb3Available, isContractDeployed } from "./web3"

const MOCK_LOTTERIES: Array<LotteryData & { id: number; participants?: string[] }> = [
  {
    id: 0,
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    title: "Mega Jackpot Draw (Demo)",
    description: "Win big in our flagship lottery with a massive prize pool. Draw happens when all tickets are sold!",
    ticketPrice: parseEther("0.05"),
    maxTickets: BigInt(100),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("2.5"),
    participants: ["0x8ba1f109551bD432803012645Ac136ddd64DBA72", "0x1234567890123456789012345678901234567890"],
  },
  {
    id: 1,
    creator: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    title: "Quick Draw Lottery (Demo)",
    description: "Fast-paced lottery with affordable tickets. Perfect for trying your luck!",
    ticketPrice: parseEther("0.01"),
    maxTickets: BigInt(50),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 2),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("0.35"),
    participants: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"],
  },
  {
    id: 2,
    creator: "0x1234567890123456789012345678901234567890",
    title: "Community Lottery (Demo)",
    description: "Support the community while winning prizes. 10% goes to charity!",
    ticketPrice: parseEther("0.02"),
    maxTickets: BigInt(200),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 7),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("1.8"),
    participants: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", "0x8ba1f109551bD432803012645Ac136ddd64DBA72"],
  },
  {
    id: 3,
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    title: "Daily Raffle (Demo)",
    description: "Small stakes, big fun! Enter daily for a chance to win.",
    ticketPrice: parseEther("0.005"),
    maxTickets: BigInt(150),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("0.45"),
    participants: [],
  },
  {
    id: 4,
    creator: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    title: "Premium Prize Pool (Demo)",
    description: "High stakes lottery for serious players. Massive rewards await!",
    ticketPrice: parseEther("0.1"),
    maxTickets: BigInt(50),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 10),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("3.2"),
    participants: ["0x1234567890123456789012345678901234567890"],
  },
  {
    id: 5,
    creator: "0x1234567890123456789012345678901234567890",
    title: "Midnight Madness (Demo)",
    description: "Late night lottery ending at midnight. Get your tickets now!",
    ticketPrice: parseEther("0.03"),
    maxTickets: BigInt(80),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 43200),
    isActive: true,
    isCompleted: false,
    winner: "0x0000000000000000000000000000000000000000",
    totalPool: parseEther("1.2"),
    participants: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"],
  },
  {
    id: 6,
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    title: "Weekend Special (Demo)",
    description: "Completed lottery - congratulations to the winner!",
    ticketPrice: parseEther("0.03"),
    maxTickets: BigInt(75),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400),
    isActive: false,
    isCompleted: true,
    winner: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    totalPool: parseEther("2.25"),
    participants: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", "0x8ba1f109551bD432803012645Ac136ddd64DBA72"],
  },
  {
    id: 7,
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    title: "New Year Mega Draw (Demo)",
    description: "Completed with 100 participants. Lucky winner took home 5 ETH!",
    ticketPrice: parseEther("0.05"),
    maxTickets: BigInt(100),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7),
    isActive: false,
    isCompleted: true,
    winner: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    totalPool: parseEther("5.0"),
    participants: ["0x8ba1f109551bD432803012645Ac136ddd64DBA72", "0x1234567890123456789012345678901234567890"],
  },
  {
    id: 8,
    creator: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    title: "Flash Friday (Demo)",
    description: "24-hour flash lottery that ended last week. Winner claimed 1.5 ETH!",
    ticketPrice: parseEther("0.025"),
    maxTickets: BigInt(60),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5),
    isActive: false,
    isCompleted: true,
    winner: "0x1234567890123456789012345678901234567890",
    totalPool: parseEther("1.5"),
    participants: ["0x1234567890123456789012345678901234567890"],
  },
  {
    id: 9,
    creator: "0x1234567890123456789012345678901234567890",
    title: "Spring Jackpot (Demo)",
    description: "Seasonal lottery that concluded with great prizes distributed!",
    ticketPrice: parseEther("0.04"),
    maxTickets: BigInt(120),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
    isActive: false,
    isCompleted: true,
    winner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    totalPool: parseEther("4.8"),
    participants: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"],
  },
]

export async function createLottery(
  title: string,
  description: string,
  ticketPrice: string,
  maxTickets: number,
  durationInDays: number,
) {
  if (!isWeb3Available()) {
    throw new Error("Please install a Web3 wallet to create lotteries")
  }

  if (!isContractDeployed()) {
    throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable with a deployed contract address.")
  }

  try {
    const contract = await getContract()
    const durationInSeconds = durationInDays * 24 * 60 * 60

    const tx = await contract.createLottery(title, description, parseEther(ticketPrice), maxTickets, durationInSeconds)

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
  } catch (error: any) {
    console.error("Error creating lottery:", error)
    throw new Error(error.message || "Failed to create lottery. Make sure the contract is deployed and you have the correct permissions.")
  }
}

export async function buyTicket(lotteryId: number, ticketPrice: bigint) {
  if (!isWeb3Available()) {
    throw new Error("Please install a Web3 wallet to buy tickets")
  }

  if (!isContractDeployed()) {
    throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable with a deployed contract address.")
  }

  try {
    const contract = await getContract()
    const tx = await contract.buyTicket(lotteryId, { value: ticketPrice })
    await tx.wait()
  } catch (error: any) {
    console.error("Error buying ticket:", error)
    throw new Error(error.message || "Failed to buy ticket. Make sure the contract is deployed and you have sufficient funds.")
  }
}

export async function selectWinner(lotteryId: number) {
  if (!isWeb3Available()) {
    throw new Error("Please install a Web3 wallet to select winners")
  }

  if (!isContractDeployed()) {
    throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS environment variable with a deployed contract address.")
  }

  try {
    const contract = await getContract()
    const tx = await contract.selectWinner(lotteryId)
    await tx.wait()
  } catch (error: any) {
    console.error("Error selecting winner:", error)
    throw new Error(error.message || "Failed to select winner. Make sure the contract is deployed and you have the correct permissions.")
  }
}

export async function getLotteryInfo(lotteryId: number): Promise<LotteryData> {
  if (!isWeb3Available() || !isContractDeployed()) {
    const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
    if (mockLottery) {
      const { id, participants, ...data } = mockLottery
      return data
    }
    throw new Error("Lottery not found")
  }

  try {
    const contract = await getContract()
    return await contract.getLotteryInfo(lotteryId)
  } catch (error) {
    // Fallback to mock data if contract call fails
    console.warn("Contract call failed, using mock data:", error)
    const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
    if (mockLottery) {
      const { id, participants, ...data } = mockLottery
      return data
    }
    throw new Error("Lottery not found")
  }
}

export async function getParticipants(lotteryId: number): Promise<string[]> {
  if (!isWeb3Available() || !isContractDeployed()) {
    const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
    if (mockLottery) {
      return mockLottery.participants || []
    }
    return []
  }

  try {
    const contract = await getContract()
    return await contract.getParticipants(lotteryId)
  } catch (error) {
    // Fallback to mock data if contract call fails
    console.warn("Contract call failed, using mock data:", error)
    const mockLottery = MOCK_LOTTERIES.find((l) => l.id === lotteryId)
    return mockLottery?.participants || []
  }
}

export async function getUserTickets(lotteryId: number, userAddress: string): Promise<number[]> {
  if (!isWeb3Available() || !isContractDeployed()) {
    return []
  }

  try {
    const contract = await getContract()
    const tickets = await contract.getUserTickets(lotteryId, userAddress)
    return tickets.map((t: bigint) => Number(t))
  } catch (error) {
    // Fallback to empty array if contract call fails
    console.warn("Contract call failed, returning empty tickets:", error)
    return []
  }
}

export async function getLotteryCount(): Promise<number> {
  if (!isWeb3Available() || !isContractDeployed()) {
    return MOCK_LOTTERIES.length
  }

  try {
    const contract = await getContract()
    const count = await contract.lotteryCount()
    return Number(count)
  } catch (error) {
    // Fallback to mock data if contract call fails
    console.warn("Contract call failed, using mock data:", error)
    return MOCK_LOTTERIES.length
  }
}

export async function getAllLotteries(): Promise<Array<LotteryData & { id: number }>> {
  if (!isWeb3Available() || !isContractDeployed()) {
    return MOCK_LOTTERIES
  }

  try {
    const count = await getLotteryCount()
    const lotteries = []

    for (let i = 0; i < count; i++) {
      const info = await getLotteryInfo(i)
      lotteries.push({ ...info, id: i })
    }

    return lotteries
  } catch (error) {
    // Fallback to mock data if contract calls fail
    console.warn("Contract calls failed, using mock data:", error)
    return MOCK_LOTTERIES
  }
}
