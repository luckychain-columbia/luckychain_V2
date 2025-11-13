"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { PixelatedCash } from "@/components/pixelated-cash"
import { RaffleCard } from "@/components/raffle-card"
import { RaffleCardSkeleton } from "@/components/raffle-card-skeleton"
import { Trophy, ArrowLeft, Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/app/context/Web3Context"
import useContract, { type ContractRaffle } from "@/app/services/contract"
import { formatEther, shortenAddress, getTimeRemaining } from "@/app/utils"

interface RaffleDetailClientProps {
  raffleId: number
}

export function RaffleDetailClient({ raffleId }: RaffleDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [raffle, setRaffle] = useState<ContractRaffle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { account } = useWeb3()
  const { loadRaffles } = useContract()

  const loadRaffle = useCallback(async () => {
    if (raffleId === null || isNaN(raffleId)) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const raffles = await loadRaffles()
      const foundRaffle = raffles.find((r) => r.id === raffleId)
      if (foundRaffle) {
        setRaffle(foundRaffle)
      } else {
        toast({
          title: "Raffle not found",
          description: `Raffle #${raffleId} does not exist.`,
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to load raffle:", error)
      toast({
        title: "Error",
        description: "Failed to load raffle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [raffleId, loadRaffles, toast, router])

  useEffect(() => {
    loadRaffle()
    
    // Refresh raffle periodically
    const interval = setInterval(() => {
      loadRaffle()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [loadRaffle])

  const handleCopyLink = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/raffle/${raffleId}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Raffle link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }, [raffleId, toast])

  const handleShare = useCallback(() => {
    if (typeof window !== "undefined" && navigator.share) {
      const url = `${window.location.origin}/raffle/${raffleId}`
      navigator.share({
        title: raffle?.title || "LuckyChain Raffle",
        text: `Check out this raffle: ${raffle?.title}`,
        url: url,
      }).catch((error) => {
        console.error("Error sharing:", error)
        // Fallback to copy link
        handleCopyLink()
      })
    } else {
      // Fallback to copy link if Web Share API is not available
      handleCopyLink()
    }
  }, [raffleId, raffle, handleCopyLink])

  const timeRemaining = useMemo(() => {
    if (!raffle || raffle.isCompleted) return "Ended"
    const endTime = Number(raffle.endTime ?? 0)
    return getTimeRemaining(endTime)
  }, [raffle])

  const isActive = useMemo(() => {
    if (!raffle) return false
    if (!raffle.isActive || raffle.isCompleted) return false
    const nowSeconds = Math.floor(Date.now() / 1000)
    const endTimestamp = Number(raffle.endTime ?? 0)
    return endTimestamp === 0 || endTimestamp > nowSeconds
  }, [raffle])

  const handleRaffleUpdate = useCallback(() => {
    loadRaffle()
  }, [loadRaffle])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/15 liquid-blob" />
          <div
            className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-400/12 liquid-blob"
            style={{ animationDelay: "-5s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-pink-400/10 liquid-blob"
            style={{ animationDelay: "-10s" }}
          />
          <div className="absolute inset-0 grid-pattern" />
          <PixelatedCash />
        </div>

        <section className="relative">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
            <nav className="flex items-center justify-between mb-8 md:mb-12 flex-wrap gap-2 md:gap-0 min-w-0">
              <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10 flex-shrink-0">
                  <Trophy className="h-5 w-5 md:h-8 md:w-8 text-white drop-shadow-lg" />
                </div>
                <span className="text-xl md:text-3xl font-bold tracking-tight text-white relative z-10 truncate">
                  LuckyChain
                </span>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 min-w-0">
                <Link href="/fyi">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                  >
                    How It Works
                  </Button>
                </Link>
                <Link href="/developers">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                  >
                    Developers
                  </Button>
                </Link>
                <WalletConnect />
              </div>
            </nav>

            <div className="max-w-4xl mx-auto">
              <Link href="/">
                <Button variant="outline" className="mb-8 glass-strong glow-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Raffles
                </Button>
              </Link>

              <RaffleCardSkeleton />
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/15 liquid-blob" />
          <div
            className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-400/12 liquid-blob"
            style={{ animationDelay: "-5s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-pink-400/10 liquid-blob"
            style={{ animationDelay: "-10s" }}
          />
          <div className="absolute inset-0 grid-pattern" />
          <PixelatedCash />
        </div>

        <section className="relative">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
            <nav className="flex items-center justify-between mb-8 md:mb-12 flex-wrap gap-2 md:gap-0 min-w-0">
              <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10 flex-shrink-0">
                  <Trophy className="h-5 w-5 md:h-8 md:w-8 text-white drop-shadow-lg" />
                </div>
                <span className="text-xl md:text-3xl font-bold tracking-tight text-white relative z-10 truncate">
                  LuckyChain
                </span>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 min-w-0">
                <Link href="/fyi">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                  >
                    How It Works
                  </Button>
                </Link>
                <Link href="/developers">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                  >
                    Developers
                  </Button>
                </Link>
                <WalletConnect />
              </div>
            </nav>

            <div className="max-w-4xl mx-auto">
              <Link href="/">
                <Button variant="outline" className="mb-8 glass-strong glow-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Raffles
                </Button>
              </Link>

              <Card className="glass-strong glow-border p-8 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Raffle not found</h2>
                <p className="text-muted-foreground mb-6">
                  The raffle you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/">
                  <Button>Go to Home</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/15 liquid-blob" />
        <div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-400/12 liquid-blob"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-pink-400/10 liquid-blob"
          style={{ animationDelay: "-10s" }}
        />
        <div className="absolute inset-0 grid-pattern" />
        <PixelatedCash />
      </div>

      <section className="relative">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
          <nav className="flex items-center justify-between mb-8 md:mb-12 flex-wrap gap-2 md:gap-0 min-w-0">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10 flex-shrink-0">
                <Trophy className="h-5 w-5 md:h-8 md:w-8 text-white drop-shadow-lg" />
              </div>
              <span className="text-xl md:text-3xl font-bold tracking-tight text-white relative z-10 truncate">
                LuckyChain
              </span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 min-w-0">
              <Link href="/fyi">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                >
                  How It Works
                </Button>
              </Link>
              <Link href="/developers">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
                >
                  Developers
                </Button>
              </Link>
              <WalletConnect />
            </div>
          </nav>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <Button variant="outline" className="glass-strong glow-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Raffles
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="glass-strong glow-border"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="glass-strong glow-border"
                  size="sm"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>

            {/* Raffle Card */}
            <div className="mb-6">
              <RaffleCard raffle={raffle} onUpdate={handleRaffleUpdate} />
            </div>

            {/* Additional Details */}
            <Card className="glass-strong glow-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Raffle Details</h3>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : raffle.isCompleted ? "Completed" : "Ended"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Raffle ID</p>
                  <p className="font-semibold">#{raffle.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Creator</p>
                  <p className="font-semibold font-mono">{shortenAddress(raffle.creator)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold">{timeRemaining}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Pool</p>
                  <p className="font-semibold">{formatEther(raffle.totalPool ?? BigInt(0))} ETH</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
