// Mock raffle data for development/testing

import type { RaffleData } from "@/app/types";
import { parseEther } from "ethers/utils";

type MockRaffle = RaffleData & {
  id: number;
  participants?: string[];
  winners?: string[];
  numWinners: number;
  creatorPct: number;
  allowMultipleEntries: boolean;
};

export const MOCK_RAFFLES: MockRaffle[] = [];
