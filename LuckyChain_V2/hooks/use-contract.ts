"use client";

import { useMemo } from "react";
import { ethers, formatEther } from "ethers";
import { useWeb3 } from "../app/context/Web3Context";
import { RAFFLE_ABI } from "@/lib/contract-abi";
import { RAFFLE_CONTRACT_ADDRESS, isWeb3Available } from "@/lib/web3";
import type { RaffleData } from "@/app/types";
import { MOCK_RAFFLES } from "../lib/mock-data";
import { contractCache, cacheKeys } from "@/lib/contract-cache";
import {
  extractErrorMessage,
  waitForTransaction,
  validateReceipt,
  extractRaffleIdFromReceipt,
  validateAndParseEther,
  validateTicketCount,
  checkOverflow,
  invalidateRaffleCreationCache,
} from "@/lib/contract-utils";

export type ContractRaffle = RaffleData & {
  id: number;
  participants?: string[];
  winners?: string[];
  numWinners?: number;
  creatorPct?: number;
  allowMultipleEntries?: boolean;
};

// Contract service hook - matches old version structure
// Uses React hook pattern for better integration with React components
const useContract = () => {
  const { provider, account } = useWeb3();

  return useMemo(() => {
    const getContractAddress = () => {
      return RAFFLE_CONTRACT_ADDRESS !==
        "0x0000000000000000000000000000000000000000"
        ? RAFFLE_CONTRACT_ADDRESS
        : null;
    };

    const getContract = async (withSigner = false) => {
      if (!isWeb3Available()) {
        return null;
      }

      const contractAddress = getContractAddress();
      if (!contractAddress || !provider) {
        return null;
      }

      try {
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
          return null;
        }

        if (withSigner) {
          const signer = await provider.getSigner();
          return new ethers.Contract(contractAddress, RAFFLE_ABI, signer);
        }
        return new ethers.Contract(contractAddress, RAFFLE_ABI, provider);
      } catch {
        return null;
      }
    };

    const loadRaffles = async (): Promise<ContractRaffle[]> => {
      try {
        const contract = await getContract(false);
        if (!contract) {
          return MOCK_RAFFLES;
        }

        // Check cache first
        const cacheKey = cacheKeys.rafflesList();
        const cached = contractCache.get<ContractRaffle[]>(cacheKey);
        if (cached) {
          return cached;
        }

        // Get raffle count (with caching)
        const count = await contractCache.getOrFetch(
          cacheKeys.raffleCount(),
          async () => Number(await contract.raffleCount()),
          contractCache.getRaffleCountTTL()
        );

        if (count === 0) {
          return MOCK_RAFFLES;
        }

        const raffles: ContractRaffle[] = [];

        // Try batch fetch first (more efficient)
        try {
          const [infos, configs] = await contract.getRaffles(0, count);
          const winnerPromises = infos.map(async (_info: any, i: number) => {
            // Check cache for winners
            const winnersKey = cacheKeys.raffleWinners(i);
            return contractCache.getOrFetch(
              winnersKey,
              async () => {
                try {
                  return await contract.getWinners(i);
                } catch {
                  return [] as string[];
                }
              },
              infos[i].isCompleted
                ? Infinity
                : contractCache.getRaffleTTL(infos[i].isCompleted)
            );
          });
          const winners = await Promise.all(winnerPromises);

          for (let i = 0; i < infos.length; i++) {
            const config = configs?.[i];
            const raffleData = {
              ...infos[i],
              id: i,
              numWinners: Number(config?.numWinners ?? 1),
              creatorPct: Number(config?.creatorPct ?? 0),
              allowMultipleEntries: Boolean(
                config?.allowMultipleEntries ?? false
              ),
              winners: winners[i] || [],
            };
            raffles.push(raffleData);

            // Cache individual raffle info
            const raffleInfoKey = cacheKeys.raffleInfo(i);
            contractCache.set(
              raffleInfoKey,
              raffleData,
              contractCache.getRaffleTTL(infos[i].isCompleted)
            );
          }
        } catch {
          // Fallback to individual fetches if batch fails
          const promises = Array.from({ length: count }, async (_, i) => {
            try {
              // Check cache for individual raffle
              const raffleInfoKey = cacheKeys.raffleInfo(i);
              const cachedRaffle =
                contractCache.get<ContractRaffle>(raffleInfoKey);
              if (cachedRaffle) {
                return cachedRaffle;
              }

              // Fetch info first to determine if completed
              const info = await contract.getRaffleInfo(i);
              const isCompleted = info.isCompleted ?? false;

              const [config, winners] = await Promise.all([
                contract.getRaffleConfig(i).catch(() => null),
                contractCache.getOrFetch(
                  cacheKeys.raffleWinners(i),
                  async () => {
                    try {
                      return await contract.getWinners(i);
                    } catch {
                      return [] as string[];
                    }
                  },
                  isCompleted
                    ? Infinity
                    : contractCache.getRaffleTTL(isCompleted)
                ),
              ]);

              const raffleData = {
                ...info,
                id: i,
                numWinners: Number(config?.numWinners ?? 1),
                creatorPct: Number(config?.creatorPct ?? 0),
                allowMultipleEntries: Boolean(
                  config?.allowMultipleEntries ?? false
                ),
                winners: winners || [],
              };

              // Cache the raffle data
              contractCache.set(
                raffleInfoKey,
                raffleData,
                contractCache.getRaffleTTL(isCompleted)
              );

              return raffleData;
            } catch (error) {
              console.warn(`Failed to load raffle ${i}:`, error);
              return null;
            }
          });

          const results = await Promise.all(promises);
          raffles.push(
            ...results.filter((l): l is ContractRaffle => l !== null)
          );
        }

        const result = raffles.length > 0 ? raffles : MOCK_RAFFLES;

        // Cache the entire list
        contractCache.set(cacheKey, result, contractCache.getRafflesListTTL());

        return result;
      } catch (error) {
        console.error("Failed to load raffles:", error);
        return MOCK_RAFFLES;
      }
    };

    const createRaffle = async (params: {
      title: string;
      description: string;
      entryFee: string;
      endDateTime: number;
      numWinners: number;
      creatorFeePct: number;
      maxEntrants?: number | null;
      allowMultipleEntries: boolean;
      seedPrizePool?: string;
    }) => {
      if (!account) {
        throw new Error("Please connect your wallet to create raffles");
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to create raffles");
      }

      const contract = await getContract(true);
      if (!contract) {
        throw new Error(
          "Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS."
        );
      }

      // Validate and normalize inputs
      if (!params.title?.trim()) {
        throw new Error("Raffle title is required");
      }
      if (params.title.trim().length > 100) {
        throw new Error("Raffle title cannot exceed 100 characters");
      }
      const entryFeeNum = Number(params.entryFee);
      if (
        isNaN(entryFeeNum) ||
        entryFeeNum <= 0 ||
        !Number.isFinite(entryFeeNum)
      ) {
        throw new Error("Ticket price must be a valid number greater than 0");
      }
      if (entryFeeNum > 1000) {
        throw new Error("Ticket price cannot exceed 1000 ETH");
      }
      if (
        params.numWinners < 1 ||
        params.numWinners > 100 ||
        !Number.isInteger(params.numWinners)
      ) {
        throw new Error(
          "Number of winners must be an integer between 1 and 100"
        );
      }
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (params.endDateTime <= nowSeconds) {
        throw new Error("End date must be in the future");
      }
      // Validate end date is not too far in the future (prevent overflow issues)
      const maxEndTime = nowSeconds + 365 * 24 * 60 * 60; // 1 year from now
      if (params.endDateTime > maxEndTime) {
        throw new Error("End date cannot be more than 1 year in the future");
      }
      // Validate max entrants (matches contract MAX_TICKETS_PER_RAFFLE = 10,000)
      if (params.maxEntrants !== null && params.maxEntrants !== undefined) {
        if (params.maxEntrants < params.numWinners) {
          throw new Error(
            `Max entrants (${params.maxEntrants}) cannot be less than number of winners (${params.numWinners})`
          );
        }
        if (params.maxEntrants > 10000) {
          throw new Error("Max entrants cannot exceed 10,000");
        }
      }

      const creatorPctBasisPoints = Math.min(
        Math.max(Math.floor(params.creatorFeePct * 100), 0),
        10_000
      );
      const maxTickets =
        params.maxEntrants && params.maxEntrants > 0
          ? BigInt(params.maxEntrants)
          : BigInt(0);

      // Validate and parse seed prize pool (optional)
      let seedAmountWei = BigInt(0);
      if (
        params.seedPrizePool !== undefined &&
        params.seedPrizePool.trim().length > 0
      ) {
        const seedAmountNum = Number(params.seedPrizePool);
        if (
          isNaN(seedAmountNum) ||
          seedAmountNum < 0 ||
          !Number.isFinite(seedAmountNum)
        ) {
          throw new Error(
            "Seed prize pool must be a valid number greater than or equal to 0"
          );
        }
        if (seedAmountNum > 1000) {
          throw new Error("Seed prize pool cannot exceed 1000 ETH");
        }
        seedAmountWei = validateAndParseEther(
          params.seedPrizePool,
          "seed prize pool"
        );
      }

      // Check balance if seeding prize pool
      if (seedAmountWei > BigInt(0) && provider) {
        try {
          const balance = await provider.getBalance(account);
          // Estimate gas cost (rough estimate: 200,000 gas * 20 gwei = 0.004 ETH)
          const estimatedGasCost = ethers.parseEther("0.004"); // 0.004 ETH for gas
          const totalRequired = seedAmountWei + estimatedGasCost;

          if (balance < seedAmountWei) {
            const balanceEth = Number(formatEther(balance));
            const seedEth = Number(params.seedPrizePool);
            throw new Error(
              `Insufficient balance. You have ${balanceEth.toFixed(
                4
              )} ETH, but need ${seedEth.toFixed(4)} ETH to seed the prize pool`
            );
          }

          // Warn if balance is close to required amount (might not have enough for gas)
          if (balance < totalRequired && balance >= seedAmountWei) {
            const balanceEth = Number(formatEther(balance));
            const seedEth = Number(params.seedPrizePool);
            console.warn(
              `Warning: Balance (${balanceEth.toFixed(
                4
              )} ETH) may not cover gas fees. Required: ${seedEth.toFixed(
                4
              )} ETH + gas`
            );
            // Don't throw error - let transaction attempt, contract will reject if insufficient
          }
        } catch (balanceError: any) {
          // If balance check fails, continue - contract will reject with better error
          if (
            balanceError.message &&
            balanceError.message.includes("Insufficient balance")
          ) {
            throw balanceError;
          }
          console.warn("Balance check failed:", balanceError);
        }
      }

      try {
        // Validate and parse entry fee
        const entryFeeWei = validateAndParseEther(params.entryFee, "entry fee");

        const tx = await contract.createRaffle(
          params.title.trim(),
          params.description?.trim() || params.title.trim(),
          entryFeeWei,
          BigInt(params.endDateTime),
          params.numWinners,
          creatorPctBasisPoints,
          maxTickets,
          params.allowMultipleEntries,
          {
            value: seedAmountWei, // Send seed amount with transaction
          }
        );

        // Wait for transaction with timeout
        const receipt = await waitForTransaction(tx.wait());
        validateReceipt(receipt);

        // Extract raffle ID from event
        const raffleId = extractRaffleIdFromReceipt(receipt, contract);

        // Invalidate cache after creating new raffle
        invalidateRaffleCreationCache(contractCache, cacheKeys);

        if (raffleId) {
          return raffleId;
        }

        // Fallback: try to get raffle count and use that as ID
        try {
          const count = await contract.raffleCount();
          return (Number(count) - 1).toString();
        } catch {
          throw new Error("Failed to extract raffle ID from transaction");
        }
      } catch (err: any) {
        console.error("Error creating raffle:", err);
        throw new Error(extractErrorMessage(err, "Failed to create raffle"));
      }
    };

    const buyTicket = async (
      raffleId: number,
      ticketPriceEth: number,
      ticketCount: number = 1
    ) => {
      if (!account) {
        throw new Error("Please connect your wallet to buy tickets");
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to buy tickets");
      }

      // Validate inputs
      validateTicketCount(ticketCount);
      if (ticketPriceEth <= 0) {
        throw new Error("Invalid ticket price");
      }

      const contract = await getContract(true);
      if (!contract) {
        throw new Error(
          "Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS."
        );
      }

      try {
        // Validate and parse ticket price
        const ticketPriceWei = validateAndParseEther(
          ticketPriceEth.toString(),
          "ticket price"
        );

        // Check for overflow in total value calculation
        const ticketCountBigInt = BigInt(ticketCount);
        if (checkOverflow(ticketPriceWei, ticketCountBigInt)) {
          throw new Error("Ticket count too large - would cause overflow");
        }
        const totalValue = ticketPriceWei * ticketCountBigInt;
        if (totalValue <= BigInt(0)) {
          throw new Error("Invalid total value - would be zero or negative");
        }

        // Pre-check balance to provide better error message
        if (provider) {
          try {
            const balance = await provider.getBalance(account);
            // Estimate gas cost (rough estimate: 100,000 gas * 20 gwei = 0.002 ETH)
            // This is a conservative estimate - actual gas may vary
            const estimatedGasCost = ethers.parseEther("0.002"); // 0.002 ETH for gas
            const totalRequired = totalValue + estimatedGasCost;

            if (balance < totalValue) {
              const balanceEth = Number(formatEther(balance));
              const requiredEth = ticketPriceEth * ticketCount;
              throw new Error(
                `Insufficient balance. You have ${balanceEth.toFixed(
                  4
                )} ETH, but need ${requiredEth.toFixed(4)} ETH for tickets`
              );
            }

            // Warn if balance is close to required amount (might not have enough for gas)
            if (balance < totalRequired && balance >= totalValue) {
              const balanceEth = Number(formatEther(balance));
              const requiredEth = ticketPriceEth * ticketCount;
              console.warn(
                `Warning: Balance (${balanceEth.toFixed(
                  4
                )} ETH) may not cover gas fees. Required: ${requiredEth.toFixed(
                  4
                )} ETH + gas`
              );
              // Don't throw error - let transaction attempt, contract will reject if insufficient
            }
          } catch (balanceError: any) {
            // If balance check fails, continue - contract will reject with better error
            if (
              balanceError.message &&
              balanceError.message.includes("Insufficient balance")
            ) {
              throw balanceError;
            }
            console.warn("Balance check failed:", balanceError);
          }
        }

        const tx = await contract.buyTickets(raffleId, BigInt(ticketCount), {
          value: totalValue,
        });

        // Wait for transaction with timeout
        const receipt = await waitForTransaction(tx.wait());
        validateReceipt(receipt);

        // Invalidate cache after buying ticket
        // invalidateRaffle already invalidates all raffle-related caches (info, participants, winners)
        // but userTickets also matches the pattern, so only invalidateRaffle is needed
        contractCache.invalidateRaffle(raffleId);

        return receipt;
      } catch (err: any) {
        console.error("Error buying ticket:", err);
        throw new Error(extractErrorMessage(err, "Failed to buy ticket"));
      }
    };

    const selectWinner = async (raffleId: number) => {
      if (!account) {
        throw new Error("Please connect your wallet to select winners");
      }

      if (!isWeb3Available()) {
        throw new Error("Please install a Web3 wallet to select winners");
      }

      const contract = await getContract(true);
      if (!contract) {
        throw new Error(
          "Smart contract not deployed. Please set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS."
        );
      }

      try {
        const tx = await contract.selectWinner(raffleId);

        // Wait for transaction with timeout
        const receipt = await waitForTransaction(tx.wait());
        validateReceipt(receipt);

        // Invalidate cache after finalizing raffle
        // invalidateRaffle already invalidates all raffle-related caches including winners and list
        contractCache.invalidateRaffle(raffleId);

        return receipt;
      } catch (err: any) {
        console.error("Error selecting winner:", err);
        throw new Error(extractErrorMessage(err, "Failed to select winner"));
      }
    };

    const getTicketCount = async (
      raffleId: number,
      userAddress?: string
    ): Promise<number> => {
      const address = userAddress || account;
      if (!address) {
        return 0;
      }

      const contract = await getContract(false);
      if (!contract) {
        return 0;
      }

      try {
        const tickets = await contract.getUserTickets(raffleId, address);
        return Array.isArray(tickets) ? tickets.length : 0;
      } catch {
        return 0;
      }
    };

    const getParticipants = async (raffleId: number): Promise<string[]> => {
      const contract = await getContract(false);
      if (!contract) {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
        return mock?.participants || [];
      }

      // Check cache first
      const cacheKey = cacheKeys.raffleParticipants(raffleId);

      try {
        return await contractCache.getOrFetch(
          cacheKey,
          async () => {
            try {
              return await contract.getParticipants(raffleId);
            } catch {
              const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
              return mock?.participants || [];
            }
          },
          contractCache.getParticipantsTTL() // Participants change frequently
        );
      } catch {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
        return mock?.participants || [];
      }
    };

    const getWinners = async (raffleId: number): Promise<string[]> => {
      const contract = await getContract(false);
      if (!contract) {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
        return mock?.winners || [];
      }

      // Check cache first
      const cacheKey = cacheKeys.raffleWinners(raffleId);

      try {
        // Try to get raffle info from cache to determine if completed
        const raffleInfoKey = cacheKeys.raffleInfo(raffleId);
        const cachedRaffle = contractCache.get<ContractRaffle>(raffleInfoKey);
        const isCompleted = cachedRaffle?.isCompleted ?? false;

        return await contractCache.getOrFetch(
          cacheKey,
          async () => {
            try {
              return await contract.getWinners(raffleId);
            } catch {
              const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
              return mock?.winners || [];
            }
          },
          isCompleted ? Infinity : contractCache.getRaffleTTL(isCompleted)
        );
      } catch {
        const mock = MOCK_RAFFLES.find((l) => l.id === raffleId);
        return mock?.winners || [];
      }
    };

    return {
      loadRaffles,
      createRaffle,
      buyTicket,
      selectWinner,
      getTicketCount,
      getParticipants,
      getWinners,
    };
  }, [provider, account]);
};

export default useContract;
