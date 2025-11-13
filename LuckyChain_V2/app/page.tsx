"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { RaffleCard } from "@/components/raffle-card"
import { CreateRaffleDialog } from "@/components/create-raffle-dialog"
import { PixelatedCash } from "@/components/pixelated-cash"
import { RaffleCardSkeleton } from "@/components/raffle-card-skeleton"
import type { RaffleData } from "@/app/types"
import { Sparkles, Trophy, Shield, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "./context/Web3Context"
import useContract, { type ContractRaffle } from "./services/contract"

export default function Home() {
  const [raffles, setRaffles] = useState<ContractRaffle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const { account: address } = useWeb3()
  const { loadRaffles: loadRafflesFromContract } = useContract()

  const handleLoadRaffles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await loadRafflesFromContract()
      setRaffles(data.reverse())
    } catch (error) {
      console.error("Failed to load raffles:", error)
      setRaffles([])
    } finally {
      setIsLoading(false)
    }
  }, [loadRafflesFromContract])

  useEffect(() => {
    handleLoadRaffles()
    
    // Refresh raffles periodically to catch expired ones
    // Note: Cache will reduce RPC calls - only active raffles will be refetched
    const interval = setInterval(() => {
      handleLoadRaffles()
    }, 30000) // Refresh every 30 seconds (cache will prevent unnecessary calls)
    
    return () => clearInterval(interval)
  }, [handleLoadRaffles])

  // Memoize filtered raffles to avoid recalculating on every render
  // Calculate current time inside the filter functions for accuracy
  const activeRaffles = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    return raffles.filter((raffle) => {
      if (!raffle.isActive || raffle.isCompleted) return false
      const endTimestamp = Number(raffle.endTime ?? 0)
      return endTimestamp === 0 || endTimestamp > nowSeconds
    })
  }, [raffles])
  
  const endedRaffles = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    return raffles.filter((raffle) => {
      if (!raffle.isActive || raffle.isCompleted) return true
      const endTimestamp = Number(raffle.endTime ?? 0)
      return endTimestamp > 0 && endTimestamp <= nowSeconds
    })
  }, [raffles])
  
  const createdRaffles = useMemo(() => {
    if (!address) return []
    const addressLower = address.toLowerCase()
    return raffles.filter((raffle) => raffle.creator?.toLowerCase() === addressLower)
  }, [raffles, address])
  
  const enteredRaffles = useMemo(() => {
    if (!address) return []
    const addressLower = address.toLowerCase()
    return raffles.filter((raffle) => {
      const participants = raffle.participants || []
      return participants.some((p: string) => p?.toLowerCase() === addressLower)
    })
  }, [raffles, address])

  const handleRaffleUpdate = useCallback(() => {
    handleLoadRaffles()
  }, [handleLoadRaffles])

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
        <div
          className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-400/8 liquid-blob"
          style={{ animationDelay: "-15s" }}
        />
        <div className="absolute inset-0 grid-pattern" />
        <PixelatedCash />
      </div>

      <section className="relative">
        <div className="relative container mx-auto px-4 py-20">
          <nav className="flex items-center justify-between mb-12 md:mb-20 flex-wrap gap-2 md:gap-0">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10">
                <Trophy className="h-5 w-5 md:h-8 md:w-8 text-white drop-shadow-lg" />
              </div>
              <span className="text-xl md:text-3xl font-bold tracking-tight text-white relative z-10">LuckyChain</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
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

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 glass glow-border px-5 py-2.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              Powered by Ethereum Smart Contracts
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-balance leading-[1.1] tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Transparent Raffle
            </h1>

            <div className="py-6 -mx-4">
              <div className="relative overflow-hidden rounded-2xl h-32 max-w-4xl mx-auto shadow-[0_0_60px_rgba(168,85,247,0.6)]">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#B57CF4]/70 liquid-blob" />
                  <div
                    className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#5EC4FF]/65 liquid-blob"
                    style={{ animationDelay: "-5s" }}
                  />
                  <div
                    className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-[#D36BFF]/60 liquid-blob"
                    style={{ animationDelay: "-10s" }}
                  />
                  <div
                    className="absolute top-1/2 right-1/4 w-[320px] h-[320px] bg-[#00D1FF]/65 liquid-blob"
                    style={{ animationDelay: "-15s" }}
                  />
                </div>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                    Decentralized
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xl text-white/90 max-w-2xl mx-auto text-pretty leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Create and participate in provably fair raffles. Every draw is transparent, verifiable, and secured by
              smart contracts on the Ethereum blockchain.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <CreateRaffleDialog onSuccess={handleRaffleUpdate} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
            <div className="glass-strong glow-border p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/30">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Provably Fair</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Smart contracts ensure complete transparency and fairness in every draw
              </p>
            </div>

            <div className="glass-strong glow-border p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center shadow-lg shadow-secondary/30">
                <Zap className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Payouts</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Winners receive their prizes automatically through smart contracts
              </p>
            </div>

            <div className="glass-strong glow-border p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center shadow-lg shadow-accent/30">
                <Trophy className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Create Your Own</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Anyone can create a raffle with custom parameters and prize pools
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24 relative">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold mb-3 tracking-tight">
                {activeTab === "active"
                  ? "Active Raffles"
                  : activeTab === "ended"
                    ? "Ended Raffles"
                    : "My Raffles"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {activeTab === "active"
                  ? "Browse and participate in ongoing raffles"
                  : activeTab === "ended"
                    ? "View completed raffle results"
                    : "Raffles you have created or entered"}
              </p>
            </div>
            <TabsList className="glass-strong">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary/20">
                Active
              </TabsTrigger>
              <TabsTrigger value="ended" className="data-[state=active]:bg-primary/20">
                Ended
              </TabsTrigger>
              <TabsTrigger value="my" className="data-[state=active]:bg-primary/20">
                My Raffles
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <RaffleCardSkeleton key={i} />
                ))}
              </div>
            ) : activeRaffles.length === 0 ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">No active raffles</h3>
                <p className="text-muted-foreground mb-8 text-lg">Be the first to create a raffle on the platform</p>
                <CreateRaffleDialog onSuccess={handleRaffleUpdate} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} raffle={raffle} onUpdate={handleRaffleUpdate} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended" className="mt-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <RaffleCardSkeleton key={i} />
                ))}
              </div>
            ) : endedRaffles.length === 0 ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">No ended raffles yet</h3>
                <p className="text-muted-foreground text-lg">Completed raffles will appear here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} raffle={raffle} onUpdate={handleRaffleUpdate} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {!address ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">Connect your wallet</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Connect your wallet to view raffles you've created or entered
                </p>
                <WalletConnect />
              </div>
            ) : isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <RaffleCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-secondary" />
                    Raffles I Entered
                  </h3>
                  {enteredRaffles.length === 0 ? (
                    <div className="glass-strong glow-border rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground">You haven't entered any raffles yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enteredRaffles.map((raffle) => (
                        <RaffleCard key={raffle.id} raffle={raffle} onUpdate={handleRaffleUpdate} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    Raffles I Created
                  </h3>
                  {createdRaffles.length === 0 ? (
                    <div className="glass-strong glow-border rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground mb-6">You haven't created any raffles yet</p>
                      <CreateRaffleDialog onSuccess={handleRaffleUpdate} />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {createdRaffles.map((raffle) => (
                        <RaffleCard key={raffle.id} raffle={raffle} onUpdate={handleRaffleUpdate} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <footer className="border-t border-border/30 mt-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30 relative z-10">
                <Trophy className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <span className="font-semibold text-lg text-white relative z-10">LuckyChain</span>
            </div>
            <p className="text-sm text-muted-foreground">Powered by Ethereum • Built with Solidity</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
