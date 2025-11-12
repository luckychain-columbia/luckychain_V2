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
  const { buyTicket, getParticipants, getWinners } = useContract()
  const { account } = useWeb3()
  const allowMultipleEntries = lottery.allowMultipleEntries ?? false

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

  const endDate = new Date(Number(lottery.endTime) * 1000)
  const now = new Date()
  const timeLeft = endDate.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)))
  const hoursLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))

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

    if (invalidTicketCount) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid ticket amount",
        variant: "destructive",
      })
      return
    }

    if (exceedsCapacity) {
      toast({
        title: "Not enough tickets",
        description: "The requested number of tickets exceeds availability",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const ticketPriceEth = Number(formatEther(lottery.ticketPrice))
      await buyTicket(lottery.id, ticketPriceEth, desiredTicketCount)
      toast({
        title: "Success!",
        description:
          desiredTicketCount > 1
            ? `${desiredTicketCount} tickets purchased successfully`
            : "Ticket purchased successfully",
      })
      await loadParticipants()
      await loadWinners()
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

  const ticketsSold = participants.length
  const maxTicketsNumber = Number(lottery.maxTickets)
  const progress =
    maxTicketsNumber > 0
      ? Math.min(100, (ticketsSold / maxTicketsNumber) * 100)
      : participants.length > 0
        ? 100
        : 0
  const rawCreatorPct = lottery.creatorPct ?? (lottery as any).creatorFeePct ?? 0
  const creatorFeePercent =
    typeof rawCreatorPct === "number"
      ? rawCreatorPct > 100
        ? rawCreatorPct / 100
        : rawCreatorPct
      : 0
  const numWinners = (lottery.numWinners ?? winners.length) || 1
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
    <Card className="glass-strong glow-border overflow-hidden border-0 shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 group">
      <div className="p-7 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {lottery.isCompleted ? (
              <Badge variant="secondary" className="glass shadow-lg text-gray-400">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Ended
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
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-3 min-h-[4.5rem]">
              {lottery.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold text-foreground">
              {ticketsSold} / {Number(lottery.maxTickets)} tickets
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden border border-border/30">
            <div
              className="h-full gradient-iridescent transition-all duration-500 shadow-lg shadow-primary/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Ticket + Prize Info */}
        <div className="grid grid-cols-2 gap-4">
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

        {lottery.isActive && !lottery.isCompleted && (
          <div className="glass p-4 rounded-2xl border border-border/40 bg-border/5 flex flex-col gap-2">
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
              disabled={!allowMultipleEntries}
              value={allowMultipleEntries ? ticketCount : 1}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                if (Number.isNaN(nextValue)) {
                  setTicketCount(1)
                  return
                }
                setTicketCount(Math.max(1, Math.floor(nextValue)))
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              {allowMultipleEntries ? "Allowed" : "Single entry"}
            </span>
          </div>
        </div>

        {/* Time + Participants */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span
              className={
                lottery.isCompleted || timeLeft <= 0 ? "text-gray-400" : ""
              }
            >
              {lottery.isCompleted
                ? "Ended"
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

        {/* Winner Section */}
        {lottery.isCompleted && (
          <div className="glass glow-border p-4 rounded-2xl">
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              Winners ({winnersToDisplay.length}/{numWinners})
            </div>
            {winnersToDisplay.length > 0 ? (
              <div className="flex flex-col gap-2">
                {winnersToDisplay.map((addr) => (
                  <div
                    key={`${lottery.id}-${addr}`}
                    className="font-mono text-sm font-semibold text-primary"
                  >
                    {shortenAddress(addr)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Awaiting winner finalization...
              </div>
            )}
          </div>
        )}

        {/* Buy Ticket Button */}
        {lottery.isActive && !lottery.isCompleted && (
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
        )}

        {!allowMultipleEntries && lottery.isActive && !lottery.isCompleted && (
          <span className="text-xs text-muted-foreground block text-center">
            Multiple entries are disabled for this lottery.
          </span>
        )}
      </div>
    </Card>
  )
}
