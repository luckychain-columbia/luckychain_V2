"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { shortenAddress, getRaffleUrl } from "@/lib/utils";
import {
  Clock,
  Users,
  Trophy,
  Coins,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useToast } from "@/hooks/use-toast";
import useContract from "@/hooks/use-contract";
import { useWeb3 } from "@/app/context/Web3Context";
import { extractErrorMessage } from "@/lib/contract-utils";
import Link from "next/link";
import { formatEther } from "ethers/utils";
import { ContractRaffle } from "@/app/types";

interface RaffleCardProps {
  raffle: ContractRaffle;
  onUpdate?: () => void;
}

export const RaffleCard = memo(function RaffleCard({
  raffle,
  onUpdate,
}: RaffleCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>(raffle.winners ?? []);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { buyTicket, getParticipants, getWinners, selectWinner } =
    useContract();
  const { account } = useWeb3();
  const allowMultipleEntries = raffle.allowMultipleEntries ?? false;
  const isCreator =
    account && raffle.creator?.toLowerCase() === account.toLowerCase();

  const loadParticipants = useCallback(async () => {
    try {
      const parts = await getParticipants(raffle.id);
      setParticipants(parts);
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
  }, [raffle.id, getParticipants]);

  const loadWinners = useCallback(async () => {
    if (!raffle.isCompleted) {
      setWinners([]);
      return;
    }

    if (raffle.winners && raffle.winners.length > 0) {
      setWinners(raffle.winners);
      return;
    }

    try {
      const fetched = await getWinners(raffle.id);
      setWinners(fetched);
    } catch (error) {
      console.warn("Failed to load winners:", error);
    }
  }, [raffle.id, raffle.isCompleted, raffle.winners, getWinners]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  useEffect(() => {
    setWinners(raffle.winners ?? []);

    if (raffle.isCompleted) {
      void loadWinners();
    }
  }, [raffle.winners, raffle.isCompleted, loadWinners]);

  useEffect(() => {
    if (!allowMultipleEntries) {
      setTicketCount(1);
    }
  }, [allowMultipleEntries]);

  // Memoize time calculations to avoid recalculating on every render
  const timeData = useMemo(() => {
    const endTimestamp = Number(raffle.endTime ?? 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const hasEnded = endTimestamp > 0 && endTimestamp <= nowSeconds;
    const endDate =
      endTimestamp > 0 && endTimestamp < Number.MAX_SAFE_INTEGER / 1000
        ? new Date(endTimestamp * 1000)
        : new Date(Date.now() + 86400000); // Default to 1 day from now if invalid
    const now = new Date();
    const timeLeft = Math.max(
      0,
      Math.min(endDate.getTime() - now.getTime(), Number.MAX_SAFE_INTEGER)
    );
    const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(
      0,
      Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    );
    const isActuallyEnded = raffle.isCompleted || hasEnded || timeLeft <= 0;

    return { hasEnded, daysLeft, hoursLeft, isActuallyEnded, timeLeft };
  }, [raffle.endTime, raffle.isCompleted]);

  const { hasEnded, daysLeft, hoursLeft, isActuallyEnded, timeLeft } = timeData;

  // Memoize expensive calculations
  const raffleCalculations = useMemo(() => {
    const ticketsSold = Math.max(0, participants.length);
    const maxTicketsNumber = Math.max(0, Number(raffle.maxTickets ?? 0));
    const maxTicketsReached =
      maxTicketsNumber > 0 && ticketsSold >= maxTicketsNumber;
    const canFinalize =
      !raffle.isCompleted &&
      participants.length > 0 &&
      (hasEnded || maxTicketsReached);
    const poolEth = Math.max(
      0,
      Number(formatEther(raffle.totalPool ?? BigInt(0)))
    );
    const rewardFromPool = (poolEth * 0.1) / 100; // 0.1% of pool
    const calculatedReward = rewardFromPool > 0.005 ? rewardFromPool : 0.005;
    const finalizationRewardEth = Math.min(
      0.01,
      Math.max(0.005, calculatedReward)
    );
    const actualReward = Math.min(finalizationRewardEth, poolEth);
    const progress =
      maxTicketsNumber > 0
        ? Math.min(100, Math.max(0, (ticketsSold / maxTicketsNumber) * 100))
        : participants.length > 0
        ? 100
        : 0;
    const rawCreatorPct = raffle.creatorPct ?? 0;
    const creatorFeePercent =
      typeof rawCreatorPct === "number"
        ? rawCreatorPct > 100
          ? rawCreatorPct / 100 // Convert basis points to percentage
          : rawCreatorPct
        : 0;
    const numWinners = Math.max(1, raffle.numWinners ?? 1);
    const ticketsRemaining =
      maxTicketsNumber > 0
        ? Math.max(0, maxTicketsNumber - ticketsSold)
        : undefined;

    return {
      ticketsSold,
      maxTicketsNumber,
      maxTicketsReached,
      canFinalize,
      actualReward,
      progress,
      creatorFeePercent,
      numWinners,
      ticketsRemaining,
    };
  }, [
    participants,
    raffle.maxTickets,
    raffle.isCompleted,
    raffle.totalPool,
    raffle.creatorPct,
    raffle.numWinners,
    hasEnded,
  ]);

  const {
    ticketsSold,
    maxTicketsNumber,
    maxTicketsReached,
    canFinalize,
    actualReward,
    progress,
    creatorFeePercent,
    numWinners,
    ticketsRemaining,
  } = raffleCalculations;

  // Memoize derived values that depend on ticketCount
  const desiredTicketCount = useMemo(
    () => (allowMultipleEntries ? ticketCount : 1),
    [allowMultipleEntries, ticketCount]
  );

  const capacityReached = useMemo(
    () => (ticketsRemaining !== undefined ? ticketsRemaining === 0 : false),
    [ticketsRemaining]
  );

  const exceedsCapacity = useMemo(
    () =>
      ticketsRemaining !== undefined
        ? desiredTicketCount > ticketsRemaining
        : false,
    [ticketsRemaining, desiredTicketCount]
  );

  const exceedsTransactionLimit = useMemo(
    () => desiredTicketCount > 1000, // Contract MAX_TICKETS_PER_TRANSACTION
    [desiredTicketCount]
  );

  const invalidTicketCount = useMemo(
    () => desiredTicketCount < 1,
    [desiredTicketCount]
  );

  const handleBuyTicket = useCallback(async () => {
    // Prevent multiple simultaneous transactions
    if (isLoading) {
      return;
    }

    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to buy tickets",
        variant: "destructive",
      });
      return;
    }

    if (!raffle.isActive || isActuallyEnded) {
      toast({
        title: "Raffle Ended",
        description:
          hasEnded && !raffle.isCompleted
            ? "This raffle has expired. Winners have not been selected yet."
            : "This raffle is no longer active",
        variant: "destructive",
      });
      return;
    }

    if (invalidTicketCount || desiredTicketCount < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid ticket amount (at least 1)",
        variant: "destructive",
      });
      return;
    }

    // Validate ticket count doesn't exceed per-transaction limit (1000)
    if (exceedsTransactionLimit) {
      toast({
        title: "Too many tickets",
        description: "Cannot purchase more than 1,000 tickets per transaction",
        variant: "destructive",
      });
      return;
    }

    if (capacityReached) {
      toast({
        title: "Raffle Full",
        description: "All tickets for this raffle have been sold",
        variant: "destructive",
      });
      return;
    }

    if (exceedsCapacity) {
      toast({
        title: "Not enough tickets",
        description: `Only ${ticketsRemaining} ticket${
          ticketsRemaining !== 1 ? "s" : ""
        } remaining`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const ticketPriceEth = Number(formatEther(raffle.ticketPrice));
      if (ticketPriceEth <= 0 || !Number.isFinite(ticketPriceEth)) {
        throw new Error("Invalid ticket price");
      }

      await buyTicket(raffle.id, ticketPriceEth, desiredTicketCount);
      toast({
        title: "Success!",
        description:
          desiredTicketCount > 1
            ? `${desiredTicketCount} tickets purchased successfully`
            : "Ticket purchased successfully",
      });

      // Refresh data - cache will be invalidated by buyTicket function
      await Promise.all([loadParticipants(), loadWinners()]);
      onUpdate?.();
      setTicketCount(1);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to purchase ticket"
      );

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    account,
    raffle.isActive,
    isActuallyEnded,
    hasEnded,
    raffle.isCompleted,
    invalidTicketCount,
    desiredTicketCount,
    exceedsTransactionLimit,
    capacityReached,
    exceedsCapacity,
    ticketsRemaining,
    raffle.id,
    raffle.ticketPrice,
    buyTicket,
    loadParticipants,
    loadWinners,
    onUpdate,
    toast,
  ]);

  const handleFinalizeRaffle = useCallback(async () => {
    // Prevent multiple simultaneous transactions
    if (isLoading) {
      return;
    }

    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to finalize the raffle",
        variant: "destructive",
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "No Participants",
        description: "Cannot finalize a raffle with no participants",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await selectWinner(raffle.id);
      toast({
        title: "Success!",
        description: "Raffle finalized and winners selected",
      });

      // Refresh data - cache will be invalidated by selectWinner function
      await Promise.all([loadParticipants(), loadWinners()]);
      onUpdate?.();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to finalize raffle"
      );

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    account,
    participants.length,
    raffle.id,
    selectWinner,
    loadParticipants,
    loadWinners,
    onUpdate,
    toast,
  ]);

  // Memoize derived values
  const winnersToDisplay = useMemo(
    () => (winners.length > 0 ? winners : raffle.winners ?? []),
    [winners, raffle.winners]
  );

  return (
    <Card className="glass-strong glow-border overflow-hidden border-0 shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 group h-full flex flex-col">
      <div className="p-7 pb-0 flex flex-col flex-1 min-h-0 gap-6">
        {/* Header */}
        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="glass text-purple-300 border-purple-500/30"
              >
                {raffle.category || "General"}
              </Badge>
              {isActuallyEnded ? (
                <Badge
                  variant="secondary"
                  className="glass shadow-lg text-gray-400"
                >
                  <Trophy className="mr-1.5 h-3.5 w-3.5" />
                  {raffle.isCompleted ? "Ended" : "Expired"}
                </Badge>
              ) : raffle.isActive ? (
                <Badge className="glass bg-primary/30 text-primary border-primary/50 shadow-lg shadow-primary/30">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="glass">
                  Inactive
                </Badge>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window !== "undefined") {
                  const url = getRaffleUrl(raffle.id);
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  toast({
                    title: "Link copied!",
                    description:
                      "Raffle link has been copied to your clipboard.",
                  });
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              title="Copy raffle link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Title + Description */}
          <div className="space-y-2">
            <Link
              href={`/raffle/${raffle.id}`}
              className="group/title block hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground truncate group-hover/title:text-primary transition-colors">
                  {raffle.title}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">#{raffle.id}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-3 h-[4.5rem]">
              {raffle.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold text-foreground">
              {maxTicketsNumber > 0
                ? `${ticketsSold} / ${maxTicketsNumber} tickets`
                : `${ticketsSold} tickets (unlimited)`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden border border-border/30">
            <div
              className="h-full gradient-iridescent transition-all duration-500 shadow-lg shadow-primary/30"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Ticket + Prize Info */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <div className="glass p-4 rounded-2xl space-y-2 border border-primary/30 bg-primary/5 h-full flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <Coins className="h-3.5 w-3.5" />
              Ticket Price
            </div>
            <div className="text-xl font-bold text-primary mt-auto">
              {formatEther(raffle.ticketPrice)} ETH
            </div>
          </div>

          <div className="glass p-4 rounded-2xl space-y-2 border border-secondary/30 bg-secondary/5 h-full flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <Trophy className="h-3.5 w-3.5" />
              Prize Pool
            </div>
            <div className="text-xl font-bold text-secondary mt-auto">
              {formatEther(raffle.totalPool)} ETH
            </div>
          </div>
        </div>

        {raffle.isActive && !isActuallyEnded && (
          <div className="glass p-4 rounded-2xl border border-border/40 bg-border/5 flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Tickets to Purchase
              </span>
              {ticketsRemaining !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {ticketsRemaining} remaining
                </span>
              )}
            </div>
            <Input
              type="number"
              min={1}
              step={1}
              max={ticketsRemaining ? Math.min(ticketsRemaining, 1000) : 1000}
              disabled={
                !allowMultipleEntries ||
                isLoading ||
                capacityReached ||
                hasEnded
              }
              value={allowMultipleEntries ? ticketCount.toString() : "1"}
              onChange={(event) => {
                const value = event.target.value;
                // Allow empty input temporarily for better UX
                if (value === "") {
                  return;
                }
                const nextValue = parseInt(value, 10);
                // Validate: must be positive integer
                if (
                  isNaN(nextValue) ||
                  nextValue < 1 ||
                  !Number.isInteger(nextValue)
                ) {
                  return;
                }
                // Cap at 1000 tickets per transaction (matches contract MAX_TICKETS_PER_TRANSACTION)
                const maxTicketsPerTransaction = 1000;
                const upperBound =
                  ticketsRemaining !== undefined
                    ? Math.min(ticketsRemaining, maxTicketsPerTransaction)
                    : maxTicketsPerTransaction;
                const clampedValue = Math.min(
                  Math.max(1, nextValue),
                  upperBound
                );
                setTicketCount(clampedValue);
              }}
              onBlur={(event) => {
                // Ensure value is valid on blur
                const value = event.target.value;
                if (value === "") {
                  setTicketCount(1);
                  return;
                }
                const parsedValue = parseInt(value, 10);
                if (isNaN(parsedValue) || parsedValue < 1) {
                  setTicketCount(1);
                  return;
                }
                // Clamp to available tickets and max limit per transaction (1000)
                const maxTicketsPerTransaction = 1000;
                const upperBound =
                  ticketsRemaining !== undefined
                    ? Math.min(ticketsRemaining, maxTicketsPerTransaction)
                    : maxTicketsPerTransaction;
                const clampedValue = Math.min(
                  Math.max(1, parsedValue),
                  upperBound
                );
                setTicketCount(clampedValue);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
          <div className="glass p-4 rounded-2xl border border-border/40 bg-border/5 flex flex-col">
            <span className="text-muted-foreground text-xs font-medium">
              Number of Winners
            </span>
            <span className="text-lg font-semibold mt-auto">{numWinners}</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-border/40 bg-border/5 flex flex-col">
            <span className="text-muted-foreground text-xs font-medium">
              Creator Fee
            </span>
            <span className="text-lg font-semibold mt-auto">
              {creatorFeePercent.toFixed(2)}%
            </span>
          </div>
          <div className="glass p-4 rounded-2xl border border-border/40 bg-border/5 flex flex-col">
            <span className="text-muted-foreground text-xs font-medium">
              Multiple Entries
            </span>
            <span className="text-lg font-semibold mt-auto">
              {allowMultipleEntries ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Time + Participants */}
        <div className="flex items-center justify-between text-sm flex-shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className={isActuallyEnded ? "text-gray-400" : ""}>
              {isActuallyEnded
                ? raffle.isCompleted
                  ? "Ended"
                  : "Expired"
                : timeLeft > 0
                ? `${daysLeft}d ${hoursLeft}h left`
                : "Ended"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{ticketsSold} participants</span>
          </div>
        </div>

        {/* Winner Section - Only for ended lotteries */}
        {isActuallyEnded && (
          <div className="glass glow-border p-4 rounded-2xl flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              Winners ({winnersToDisplay.length}/{numWinners})
            </div>
            {winnersToDisplay.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto">
                {winnersToDisplay.map((addr) => (
                  <div
                    key={`${raffle.id}-${addr}`}
                    className="font-mono text-sm font-semibold text-primary"
                  >
                    {shortenAddress(addr)}
                  </div>
                ))}
              </div>
            ) : raffle.isCompleted ? (
              <div className="text-muted-foreground text-sm">
                No winners selected
              </div>
            ) : participants.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No participants - raffle expired with no entries
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Awaiting winner finalization...
              </div>
            )}
          </div>
        )}

        {/* Spacer to push content and ensure button alignment */}
        <div className="flex-1 min-h-0" />
      </div>

      {/* Buy Ticket Button - Fixed at bottom with consistent alignment */}
      {raffle.isActive && !isActuallyEnded && (
        <div className="flex-shrink-0 px-7 pb-7 pt-1.5 border-t border-border/20">
          <Button
            onClick={handleBuyTicket}
            disabled={
              isLoading ||
              capacityReached ||
              invalidTicketCount ||
              exceedsCapacity
            }
            className="w-full glass-strong font-semibold text-base h-12 gradient-iridescent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            {isLoading
              ? "Processing..."
              : allowMultipleEntries && desiredTicketCount > 1
              ? `Buy ${desiredTicketCount} Tickets`
              : "Buy Ticket"}
          </Button>
          {/* Disclaimer text - always reserves space to maintain button alignment */}
          <div className="h-5 mt-1.5">
            {!allowMultipleEntries && (
              <span className="text-xs text-muted-foreground block text-center">
                Multiple entries are disabled for this raffle.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Finalize Raffle Button - Anyone can finalize expired lotteries, creator can finalize early when max tickets reached */}
      {canFinalize && (
        <div className="flex-shrink-0 px-7 pb-7 pt-1.5 border-t border-border/20">
          <Button
            onClick={handleFinalizeRaffle}
            disabled={isLoading}
            className="w-full glass-strong font-semibold text-base h-12 bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            {isLoading ? "Finalizing..." : "Finalize Raffle & Select Winners"}
          </Button>
          <div className="h-5 mt-1.5">
            <span className="text-xs text-muted-foreground block text-center">
              {hasEnded
                ? `Finalizing rewards you ${actualReward.toFixed(
                    4
                  )} ETH from the pool (covers gas).`
                : maxTicketsReached
                ? `All tickets sold. Finalizing rewards you ${actualReward.toFixed(4)} ETH from the pool (covers gas).`
                : `Click to finalize and receive ${actualReward.toFixed(4)} ETH reward from the pool (covers gas).`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
