"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { LotteryCard } from "@/components/lottery-card"
import { CreateLotteryDialog } from "@/components/create-lottery-dialog"
import { PixelatedCash } from "@/components/pixelated-cash"
import type { LotteryData } from "@/lib/web3"
import { Sparkles, Trophy, Shield, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "./context/Web3Context"
import useContract, { type ContractLottery } from "./services/contract"

export default function Home() {
  const [lotteries, setLotteries] = useState<ContractLottery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const { account: address } = useWeb3()
  const { loadLotteries: loadLotteriesFromContract } = useContract()

  async function handleLoadLotteries() {
    setIsLoading(true)
    try {
      const data = await loadLotteriesFromContract()
      setLotteries(data.reverse())
    } catch (error) {
      console.error("Failed to load lotteries:", error)
      setLotteries([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleLoadLotteries()
    
    // Refresh lotteries periodically to catch expired ones
    const interval = setInterval(() => {
      handleLoadLotteries()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Filter lotteries - check if time has expired even if not completed
  const activeLotteries = lotteries.filter((lottery) => {
    if (!lottery.isActive || lottery.isCompleted) return false
    const endTimestamp = Number(lottery.endTime ?? 0)
    const nowSeconds = Math.floor(Date.now() / 1000)
    return endTimestamp === 0 || endTimestamp > nowSeconds
  })
  
  const endedLotteries = lotteries.filter((lottery) => {
    if (!lottery.isActive || lottery.isCompleted) return true
    const endTimestamp = Number(lottery.endTime ?? 0)
    const nowSeconds = Math.floor(Date.now() / 1000)
    return endTimestamp > 0 && endTimestamp <= nowSeconds
  })
  const createdLotteries = address
    ? lotteries.filter((lottery) => lottery.creator?.toLowerCase() === address.toLowerCase())
    : []
  const enteredLotteries = address
    ? lotteries.filter((lottery) => {
        const participants = lottery.participants || []
        return participants.some((p: string) => p?.toLowerCase() === address.toLowerCase())
      })
    : []

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
          <nav className="flex items-center justify-between mb-20">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10">
                <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white relative z-10">LuckyChain</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/fyi">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 hidden md:flex"
                >
                  How It Works
                </Button>
              </Link>
              <Link href="/developers">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 hidden md:flex"
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
              Transparent Lottery
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
              Create and participate in provably fair lotteries. Every draw is transparent, verifiable, and secured by
              smart contracts on the Ethereum blockchain.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <CreateLotteryDialog onSuccess={handleLoadLotteries} />
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
                Anyone can create a lottery with custom parameters and prize pools
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
                  ? "Active Lotteries"
                  : activeTab === "ended"
                    ? "Ended Lotteries"
                    : "My Lotteries"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {activeTab === "active"
                  ? "Browse and participate in ongoing lotteries"
                  : activeTab === "ended"
                    ? "View completed lottery results"
                    : "Lotteries you have created or entered"}
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
                My Lotteries
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-strong h-96 rounded-3xl shimmer" />
                ))}
              </div>
            ) : activeLotteries.length === 0 ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">No active lotteries</h3>
                <p className="text-muted-foreground mb-8 text-lg">Be the first to create a lottery on the platform</p>
                <CreateLotteryDialog onSuccess={handleLoadLotteries} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLotteries.map((lottery) => (
                  <LotteryCard key={lottery.id} lottery={lottery} onUpdate={handleLoadLotteries} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended" className="mt-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-strong h-96 rounded-3xl shimmer" />
                ))}
              </div>
            ) : endedLotteries.length === 0 ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">No ended lotteries yet</h3>
                <p className="text-muted-foreground text-lg">Completed lotteries will appear here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedLotteries.map((lottery) => (
                  <LotteryCard key={lottery.id} lottery={lottery} onUpdate={handleLoadLotteries} />
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
                  Connect your wallet to view lotteries you've created or entered
                </p>
                <WalletConnect />
              </div>
            ) : isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-strong h-96 rounded-3xl shimmer" />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-secondary" />
                    Lotteries I Entered
                  </h3>
                  {enteredLotteries.length === 0 ? (
                    <div className="glass-strong glow-border rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground">You haven't entered any lotteries yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enteredLotteries.map((lottery) => (
                        <LotteryCard key={lottery.id} lottery={lottery} onUpdate={handleLoadLotteries} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    Lotteries I Created
                  </h3>
                  {createdLotteries.length === 0 ? (
                    <div className="glass-strong glow-border rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground mb-6">You haven't created any lotteries yet</p>
                      <CreateLotteryDialog onSuccess={handleLoadLotteries} />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {createdLotteries.map((lottery) => (
                        <LotteryCard key={lottery.id} lottery={lottery} onUpdate={handleLoadLotteries} />
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
