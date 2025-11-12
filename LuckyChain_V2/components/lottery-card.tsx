"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ContractLottery } from "@/app/services/contract"
import { formatEther, shortenAddress } from "@/app/utils"
import { Clock, Users, Trophy, Coins } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import useContract from "@/app/services/contract"
import { useWeb3 } from "@/app/context/Web3Context"

interface LotteryCardProps {
  lottery: ContractLottery
  onUpdate?: () => void
}

export function LotteryCard({ lottery, onUpdate }: LotteryCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [winners, setWinners] = useState<string[]>(lottery.winners ?? [])
  const [ticketCount, setTicketCount] = useState<number>(1)
  const { toast } = useToast()
  const { buyTicket, getParticipants, getWinners, selectWinner } = useContract()
  const { account } = useWeb3()
  const allowMultipleEntries = lottery.allowMultipleEntries ?? false
  const isCreator = account && lottery.creator?.toLowerCase() === account.toLowerCase()

  useEffect(() => {
    loadParticipants()
  }, [lottery.id])

  useEffect(() => {
    setWinners(lottery.winners ?? [])

    if (lottery.isCompleted) {
      void loadWinners()
    }
  }, [lottery.id, lottery.isCompleted, lottery.winners])

  useEffect(() => {
    if (!allowMultipleEntries) {
      setTicketCount(1)
    }
  }, [lottery.id, allowMultipleEntries])

  // Calculate time remaining with proper edge case handling
  const endTimestamp = Number(lottery.endTime ?? 0)
  const nowSeconds = Math.floor(Date.now() / 1000)
  const hasEnded = endTimestamp > 0 && endTimestamp <= nowSeconds
  const endDate = endTimestamp > 0 ? new Date(endTimestamp * 1000) : new Date()
  const now = new Date()
  const timeLeft = Math.max(0, endDate.getTime() - now.getTime())
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  // Determine if lottery should be considered ended (even if not finalized)
  const isActuallyEnded = lottery.isCompleted || hasEnded || timeLeft <= 0

  async function loadParticipants() {
    try {
      const parts = await getParticipants(lottery.id)
      setParticipants(parts)
    } catch (error) {
      console.error("Failed to load participants:", error)
    }
  }

  async function loadWinners() {
    if (!lottery.isCompleted) {
      setWinners([])
      return
    }

    if (lottery.winners && lottery.winners.length > 0) {
      setWinners(lottery.winners)
      return
    }

    try {
      const fetched = await getWinners(lottery.id)
      setWinners(fetched)
    } catch (error) {
      console.warn("Failed to load winners:", error)
    }
  }

  async function handleBuyTicket() {
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to buy tickets",
        variant: "destructive",
      })
      return
    }

    if (!lottery.isActive || isActuallyEnded) {
      toast({
        title: "Lottery Ended",
        description: hasEnded && !lottery.isCompleted
          ? "This lottery has expired. Winners have not been selected yet."
          : "This lottery is no longer active",
        variant: "destructive",
      })
      return
    }

    if (invalidTicketCount || desiredTicketCount < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid ticket amount (at least 1)",
        variant: "destructive",
      })
      return
    }

    if (capacityReached) {
      toast({
        title: "Lottery Full",
        description: "All tickets for this lottery have been sold",
        variant: "destructive",
      })
      return
    }

    if (exceedsCapacity) {
      toast({
        title: "Not enough tickets",
        description: `Only ${ticketsRemaining} ticket${ticketsRemaining !== 1 ? "s" : ""} remaining`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const ticketPriceEth = Number(formatEther(lottery.ticketPrice))
      if (ticketPriceEth <= 0 || !Number.isFinite(ticketPriceEth)) {
        throw new Error("Invalid ticket price")
      }

      await buyTicket(lottery.id, ticketPriceEth, desiredTicketCount)
      toast({
        title: "Success!",
        description:
          desiredTicketCount > 1
            ? `${desiredTicketCount} tickets purchased successfully`
            : "Ticket purchased successfully",
      })
      
      // Refresh data
      await Promise.all([loadParticipants(), loadWinners()])
      onUpdate?.()
      setTicketCount(1)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase ticket",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFinalizeLottery() {
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to finalize the lottery",
        variant: "destructive",
      })
      return
    }

    if (participants.length === 0) {
      toast({
        title: "No Participants",
        description: "Cannot finalize a lottery with no participants",
        variant: "destructive",
      })
      return
    }

    // Check authorization based on lottery state
    if (!hasEnded && maxTicketsReached && !isCreator) {
      toast({
        title: "Unauthorized",
        description: "Only the lottery creator can finalize early when max tickets are reached",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await selectWinner(lottery.id)
      toast({
        title: "Success!",
        description: "Lottery finalized and winners selected",
      })
      
      // Refresh data
      await Promise.all([loadParticipants(), loadWinners()])
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to finalize lottery",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ticketsSold = participants.length
  const maxTicketsNumber = Number(lottery.maxTickets)
  const maxTicketsReached = maxTicketsNumber > 0 && ticketsSold >= maxTicketsNumber
  // Anyone can finalize expired lotteries, but only creator can finalize early when max tickets reached
  const canFinalize = !lottery.isCompleted && participants.length > 0 && (hasEnded || (maxTicketsReached && isCreator))
  
  // Calculate finalization reward (only for expired lotteries)
  // Reward = min(max(0.1% of pool, 0.001 ETH), 0.01 ETH)
  // This covers gas costs and incentivizes finalization
  const poolEth = Number(formatEther(lottery.totalPool))
  const rewardFromPool = (poolEth * 0.1) / 100 // 0.1% of pool
  const calculatedReward = rewardFromPool > 0.001 ? rewardFromPool : 0.001
  const finalizationRewardEth = calculatedReward > 0.01 ? 0.01 : calculatedReward
  // Cap at pool size to avoid taking more than available
  const actualReward = finalizationRewardEth > poolEth ? poolEth : finalizationRewardEth
  
  const progress =
    maxTicketsNumber > 0
      ? Math.min(100, (ticketsSold / maxTicketsNumber) * 100)
      : participants.length > 0
        ? 100
        : 0
  // Normalize creator fee percentage (contract uses basis points, frontend uses percentage)
  const rawCreatorPct = lottery.creatorPct ?? 0
  const creatorFeePercent =
    typeof rawCreatorPct === "number"
      ? rawCreatorPct > 100
        ? rawCreatorPct / 100 // Convert basis points to percentage
        : rawCreatorPct
      : 0
  const numWinners = Math.max(1, lottery.numWinners ?? 1)
  const winnersToDisplay =
    winners.length > 0 ? winners : (lottery.winners ?? [])
  const ticketsRemaining =
    maxTicketsNumber > 0
      ? Math.max(0, maxTicketsNumber - ticketsSold)
      : undefined
  const desiredTicketCount = allowMultipleEntries ? ticketCount : 1
  const capacityReached =
    ticketsRemaining !== undefined ? ticketsRemaining === 0 : false
  const exceedsCapacity =
    ticketsRemaining !== undefined
      ? desiredTicketCount > ticketsRemaining
      : false
  const invalidTicketCount = desiredTicketCount < 1

  return (
    <Card className="glass-strong glow-border overflow-hidden border-0 shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 group h-full flex flex-col">
      <div className="p-7 pb-0 flex flex-col flex-1 min-h-0 gap-6">
        {/* Header */}
        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {isActuallyEnded ? (
              <Badge variant="secondary" className="glass shadow-lg text-gray-400">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                {lottery.isCompleted ? "Ended" : "Expired"}
              </Badge>
            ) : lottery.isActive ? (
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

          {/* Title + Description */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground truncate">
              {lottery.title}
            </h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-3 h-[4.5rem]">
              {lottery.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold text-foreground">
              {maxTicketsNumber > 0 ? (
                `${ticketsSold} / ${maxTicketsNumber} tickets`
              ) : (
                `${ticketsSold} tickets (unlimited)`
              )}
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
              {formatEther(lottery.ticketPrice)} ETH
            </div>
          </div>

          <div className="glass p-4 rounded-2xl space-y-2 border border-secondary/30 bg-secondary/5 h-full flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <Trophy className="h-3.5 w-3.5" />
              Prize Pool
            </div>
            <div className="text-xl font-bold text-secondary mt-auto">
              {formatEther(lottery.totalPool)} ETH
            </div>
          </div>
        </div>

        {lottery.isActive && !isActuallyEnded && (
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
              max={ticketsRemaining || undefined}
              disabled={!allowMultipleEntries || isLoading || capacityReached || hasEnded}
              value={allowMultipleEntries ? ticketCount : 1}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                if (Number.isNaN(nextValue) || nextValue < 1) {
                  setTicketCount(1)
                  return
                }
                const clamped = Math.max(1, Math.floor(nextValue))
                // Clamp to available tickets if max is set
                const maxAllowed = ticketsRemaining !== undefined 
                  ? Math.min(clamped, ticketsRemaining)
                  : clamped
                setTicketCount(maxAllowed)
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
                ? lottery.isCompleted
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
                    key={`${lottery.id}-${addr}`}
                    className="font-mono text-sm font-semibold text-primary"
                  >
                    {shortenAddress(addr)}
                  </div>
                ))}
              </div>
            ) : lottery.isCompleted ? (
              <div className="text-muted-foreground text-sm">
                No winners selected
              </div>
            ) : participants.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No participants - lottery expired with no entries
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
      {lottery.isActive && !isActuallyEnded && (
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
                Multiple entries are disabled for this lottery.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Finalize Lottery Button - Anyone can finalize expired lotteries, creator can finalize early when max tickets reached */}
      {canFinalize && (
        <div className="flex-shrink-0 px-7 pb-7 pt-1.5 border-t border-border/20">
          <Button
            onClick={handleFinalizeLottery}
            disabled={isLoading}
            className="w-full glass-strong font-semibold text-base h-12 bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            {isLoading ? "Finalizing..." : "Finalize Lottery & Select Winners"}
          </Button>
          <div className="h-5 mt-1.5">
            <span className="text-xs text-muted-foreground block text-center">
              {hasEnded
                ? `Finalizing rewards you ${actualReward.toFixed(4)} ETH from the pool (covers gas).`
                : maxTicketsReached
                ? isCreator
                  ? "All tickets sold. Click to select winners and distribute prizes."
                  : "All tickets sold. Only creator can finalize early."
                : "Click to select winners and distribute prizes."}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
