"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type LotteryData, formatEther, shortenAddress, isWeb3Available } from "@/lib/web3"
import { Clock, Users, Trophy, Coins } from "lucide-react"
import { useState, useEffect } from "react"
import { buyTicket, getParticipants } from "@/lib/lottery-service"
import { useToast } from "@/hooks/use-toast"

interface LotteryCardProps {
  lottery: LotteryData & { id: number }
  onUpdate?: () => void
}

export function LotteryCard({ lottery, onUpdate }: LotteryCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadParticipants()
  }, [lottery.id])

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

  async function handleBuyTicket() {
    if (!isWeb3Available()) {
      toast({
        title: "Wallet Required",
        description: "Please install MetaMask or another Web3 wallet to buy tickets",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await buyTicket(lottery.id, lottery.ticketPrice)
      toast({
        title: "Success!",
        description: "Ticket purchased successfully",
      })
      await loadParticipants()
      onUpdate?.()
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
  const progress = (ticketsSold / Number(lottery.maxTickets)) * 100

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
        {lottery.isCompleted &&
          lottery.winner !==
            "0x0000000000000000000000000000000000000000" && (
            <div className="glass glow-border p-4 rounded-2xl">
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Winner
              </div>
              <div className="font-mono text-sm font-semibold text-primary">
                {shortenAddress(lottery.winner)}
              </div>
            </div>
          )}

        {/* Buy Ticket Button */}
        {lottery.isActive && !lottery.isCompleted && (
          <Button
            onClick={handleBuyTicket}
            disabled={
              isLoading || ticketsSold >= Number(lottery.maxTickets)
            }
            className="w-full glass-strong font-semibold text-base h-12 gradient-iridescent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            {isLoading ? "Processing..." : "Buy Ticket"}
          </Button>
        )}
      </div>
    </Card>
  )
}
