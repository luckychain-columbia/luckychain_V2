// Type definitions for raffle platform
// Based on old version structure with additions from new version

export interface RaffleData {
  creator: string;
  title: string;
  description: string;
  category: string;
  ticketPrice: bigint;
  maxTickets: bigint;
  endTime: bigint;
  isActive: boolean;
  isCompleted: boolean;
  winner: string;
  totalPool: bigint;
}

export type ContractRaffle = RaffleData & {
  id: number;
  participants?: string[];
  winners?: string[];
  numWinners?: number;
  creatorPct?: number;
  allowMultipleEntries?: boolean;
};

export interface RaffleConfig {
  numWinners: number;
  creatorPct: number; // basis points (0-10000)
  allowMultipleEntries: boolean;
}

// User's raffle entries/tickets
export interface Ticket {
  id: string;
  raffleId: string;
  raffleTitle: string;
  category: string;
  entryFee: string;
  ticketCount: number; // How many tickets the user has for this raffle
  prizePercentage?: number;
  numberOfWinners?: number;
  endDate: string;
  totalEntrants: number;
  status: "active" | "ended" | "won" | "lost";
  amountWon?: string; // If user won
}
