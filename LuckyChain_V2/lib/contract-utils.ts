/**
 * Common utility functions for contract interactions
 * Extracted to reduce code duplication and improve maintainability
 */

import { ContractRaffle } from "@/app/types";
import { ethers } from "ethers";

/**
 * Extract user-friendly error message from various error types
 * Centralized error handling to reduce code duplication
 */
export function extractErrorMessage(
  error: any,
  defaultMessage: string
): string {
  // Handle user rejection
  if (
    error?.code === 4001 ||
    error?.message?.toLowerCase().includes("user rejected") ||
    error?.message?.toLowerCase().includes("user denied")
  ) {
    return "Transaction was rejected by user";
  }

  // Handle transaction timeout
  if (error?.message?.includes("timeout")) {
    return error.message;
  }

  // Handle contract revert with reason
  if (error?.reason) {
    return error.reason;
  }

  // Handle specific error messages that should be passed through
  if (
    error?.message?.includes("Insufficient balance") ||
    error?.code === "INSUFFICIENT_FUNDS" ||
    error?.message?.includes("Invalid entry fee") ||
    error?.message?.includes("Invalid ticket price")
  ) {
    return error.message;
  }

  // Extract error message
  return error?.message || defaultMessage;
}

/**
 * Wait for transaction with timeout
 */
export async function waitForTransaction(
  txPromise: Promise<any>,
  timeoutMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<any> {
  return Promise.race([
    txPromise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("Transaction timeout - please check your wallet")),
        timeoutMs
      )
    ),
  ]) as Promise<any>;
}

/**
 * Validate transaction receipt
 */
export function validateReceipt(receipt: any): void {
  if (!receipt || !receipt.status) {
    throw new Error("Transaction failed or was reverted");
  }
}

/**
 * Extract raffle ID from transaction receipt
 */
export function extractRaffleIdFromReceipt(
  receipt: any,
  contract: ethers.Contract
): string | null {
  // Try to extract from event
  const event = receipt.logs?.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "RaffleCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    try {
      const parsed = contract.interface.parseLog(event);
      const raffleId = parsed?.args?.[0]?.toString();
      if (raffleId !== undefined) {
        return raffleId;
      }
    } catch (parseError) {
      console.warn("Failed to parse RaffleCreated event:", parseError);
    }
  }

  return null;
}

/**
 * Validate and parse ether amount
 */
export function validateAndParseEther(
  amount: string,
  fieldName: string = "amount"
): bigint {
  try {
    const wei = ethers.parseEther(amount);
    if (wei <= BigInt(0)) {
      throw new Error(`${fieldName} must be greater than 0`);
    }
    return wei;
  } catch (parseError: any) {
    throw new Error(
      `Invalid ${fieldName}: ${parseError.message || "Cannot parse to wei"}`
    );
  }
}

/**
 * Validate ticket count
 * @param ticketCount - Number of tickets to validate
 * @param maxTicketsPerTransaction - Maximum tickets per transaction (default: 1000 to match contract)
 * @param maxTicketsPerRaffle - Maximum tickets per raffle (default: 10000 to match contract)
 */
export function validateTicketCount(
  ticketCount: number,
  maxTicketsPerTransaction: number = 1000,
  maxTicketsPerRaffle: number = 10000
): void {
  if (ticketCount < 1 || !Number.isInteger(ticketCount)) {
    throw new Error("Ticket count must be a positive integer");
  }
  if (ticketCount > maxTicketsPerTransaction) {
    throw new Error(
      `Ticket count cannot exceed ${maxTicketsPerTransaction} per transaction`
    );
  }
  if (ticketCount > maxTicketsPerRaffle) {
    throw new Error(
      `Ticket count cannot exceed ${maxTicketsPerRaffle} per raffle`
    );
  }
}

/**
 * Check for overflow in BigInt multiplication
 */
export function checkOverflow(a: bigint, b: bigint): boolean {
  if (a === BigInt(0) || b === BigInt(0)) {
    return false;
  }
  const product = a * b;
  return product / a !== b;
}

/**
 * Invalidate cache after creating a new raffle
 */
export function invalidateRaffleCreationCache(
  contractCache: { invalidate: (key: string) => void },
  cacheKeys: { rafflesList: () => string; raffleCount: () => string }
): void {
  contractCache.invalidate(cacheKeys.rafflesList());
  contractCache.invalidate(cacheKeys.raffleCount());
}

// Converts a raw Result from getLotteries() or getLottery() to plain JS
export function normalizeLottery(info: any, id: number): ContractRaffle {
  return {
    // Required UI fields -----------------------
    id,

    // RaffleInfo
    creator: info.creator ?? info[0],
    title: info.title ?? info[1],
    description: info.description ?? info[2],
    category: info.category ?? info[3] ?? "General",
    ticketPrice: BigInt(info.ticketPrice ?? info[4] ?? 0),
    maxTickets: BigInt(info.maxTickets ?? info[5] ?? 0),
    endTime: BigInt(info.endTime ?? info[6] ?? 0),
    isActive: Boolean(info.isActive ?? info[7]),
    isCompleted: Boolean(info.isCompleted ?? info[8]),
    winner: info.winner ?? info[9],
    totalPool: BigInt(info.totalPool ?? info[10] ?? 0),
  };
}
