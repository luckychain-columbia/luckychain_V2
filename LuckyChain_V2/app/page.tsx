"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { RaffleCard } from "@/components/raffle-card";
import { CreateRaffleDialog } from "@/components/create-raffle-dialog";
import { RaffleCardSkeleton } from "@/components/raffle-card-skeleton";
import { Sparkles, Trophy, Shield, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3 } from "./context/Web3Context";
import useContract from "@/hooks/use-contract";
import { ContractRaffle } from "@/app/types";
import Background from "@/components/background";

const tabs = {
  active: {
    title: "Active Raffles",
    desc: "Browse and participate in ongoing raffles",
  },
  ended: {
    title: "Ended Raffles",
    desc: "View completed raffle results",
  },
  my: {
    title: "My Raffles",
    desc: "Raffles you have created or entered",
  },
};

export default function Home() {
  const [raffles, setRaffles] = useState<ContractRaffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "ended" | "my">(
    "active"
  );
  const { account: address } = useWeb3();
  const { loadRaffles: loadRafflesFromContract, getTicketCount } = useContract();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [enteredRaffles, setEnteredRaffles] = useState<ContractRaffle[]>([]);
  const [isCheckingEnteredRaffles, setIsCheckingEnteredRaffles] = useState(false);

  const handleLoadRaffles = useCallback(async () => {
    try {
      const data = await loadRafflesFromContract();
      setRaffles([...data].reverse());
    } catch (error) {
      console.error("Failed to load raffles:", error);
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadRafflesFromContract]);

  useEffect(() => {
    handleLoadRaffles();

    // Refresh raffles periodically to catch expired ones
    // Note: Cache will reduce RPC calls - only active raffles will be refetched
    // const interval = setInterval(() => {
    //   handleLoadRaffles();
    // }, 30000); // Refresh every 30 seconds (cache will prevent unnecessary calls)

    // return () => clearInterval(interval);
  }, [handleLoadRaffles]);

  // Get all categories currently present in the data and 
  // return "All" with the sorted list of unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set(raffles.map(r => r.category || "General"));
    return ["All", ...Array.from(categories).sort()];
  }, [raffles]);

  // Memoize filtered raffles to avoid recalculating on every render
  // Calculate current time inside the filter functions for accuracy
  const activeRaffles = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return raffles.filter((raffle) => {
      if (selectedCategory !== "All" && raffle.category !== selectedCategory) return false;
      if (!raffle.isActive || raffle.isCompleted) return false;
      const endTimestamp = Number(raffle.endTime ?? 0);
      return endTimestamp === 0 || endTimestamp > nowSeconds;
    });
  }, [raffles, selectedCategory]);

  const endedRaffles = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return raffles.filter((raffle) => {
      if (selectedCategory !== "All" && raffle.category !== selectedCategory) return false;
      if (!raffle.isActive || raffle.isCompleted) return true;
      const endTimestamp = Number(raffle.endTime ?? 0);
      return endTimestamp > 0 && endTimestamp <= nowSeconds;
    });
  }, [raffles, selectedCategory]);

  const createdRaffles = useMemo(() => {
    if (!address) return [];
    const addressLower = address.toLowerCase();
    return raffles.filter((raffle) => {
      if (selectedCategory !== "All" && raffle.category !== selectedCategory) return false;
      return raffle.creator?.toLowerCase() === addressLower;
    });
  }, [raffles, address, selectedCategory]);

  // Check which raffles the user has entered by checking their ticket count
  useEffect(() => {
    const checkEnteredRaffles = async () => {
      if (!address || raffles.length === 0) {
        setEnteredRaffles([]);
        setIsCheckingEnteredRaffles(false);
        return;
      }

      setIsCheckingEnteredRaffles(true);
      try {
        // Check tickets for all raffles in parallel
        const ticketCounts = await Promise.all(
          raffles.map((raffle) => getTicketCount(raffle.id, address))
        );

        // Filter raffles where user has at least one ticket
        const entered = raffles.filter((_, index) => ticketCounts[index] > 0);
        setEnteredRaffles(entered);
      } catch (error) {
        console.error("Failed to check entered raffles:", error);
        setEnteredRaffles([]);
      } finally {
        setIsCheckingEnteredRaffles(false);
      }
    };

    void checkEnteredRaffles();
  }, [raffles, address, getTicketCount]);

  // Filter entered raffles by category
  const filteredEnteredRaffles = useMemo(() => {
    if (selectedCategory === "All") return enteredRaffles;
    return enteredRaffles.filter(
      (raffle) => raffle.category === selectedCategory
    );
  }, [enteredRaffles, selectedCategory]);

  // Filter created raffles by category is already handled in createdRaffles useMemo above

  const handleRaffleUpdate = useCallback(() => {
    handleLoadRaffles();
  }, [handleLoadRaffles]);

  return (
    <div>
      <section className="relative">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-12 max-w-screen-xl">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 glass glow-border px-5 py-2.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              Powered by Ethereum Smart Contracts
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-balance leading-[1.1] tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Transparent Raffle
            </h1>

            <div className="py-8 md:py-12">
              <div className="relative overflow-hidden rounded-2xl h-32 md:h-40 max-w-4xl mx-auto shadow-[0_0_60px_rgba(168,85,247,0.6)] px-4 sm:px-6">
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
                <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                    Decentralized
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xl text-white/90 max-w-2xl mx-auto text-pretty leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Create and participate in provably fair raffles. Every draw is
              transparent, verifiable, and secured by smart contracts on the
              Ethereum blockchain.
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
                Smart contracts ensure complete transparency and fairness in
                every draw
              </p>
            </div>

            <div className="glass-strong glow-border p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center shadow-lg shadow-secondary/30">
                <Zap className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Payouts</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Winners receive their prizes automatically through smart
                contracts
              </p>
            </div>

            <div className="glass-strong glow-border p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center shadow-lg shadow-accent/30">
                <Trophy className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Create Your Own</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Anyone can create a raffle with custom parameters and prize
                pools
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-4 py-24 relative max-w-screen-xl">
        <Tabs
          defaultValue="active"
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "active" | "ended" | "my")
          }
          className="w-full"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold mb-3 tracking-tight">
                {tabs[activeTab].title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {tabs[activeTab].desc}
              </p>
            </div>
            <TabsList className="glass-strong">
              {Object.entries(tabs).map(([key, value]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary/20"
                >
                  {value.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex gap-2 mb-6 mt-6 overflow-x-auto pb-2">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
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
                <h3 className="text-2xl font-semibold mb-3">
                  No active raffles
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Be the first to create a raffle on the platform
                </p>
                <CreateRaffleDialog onSuccess={handleRaffleUpdate} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRaffles.map((r) => (
                  <RaffleCard
                    key={r.id}
                    raffle={r}
                    onUpdate={handleLoadRaffles}
                  />
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
                <h3 className="text-2xl font-semibold mb-3">
                  No ended raffles yet
                </h3>
                <p className="text-muted-foreground text-lg">
                  Completed raffles will appear here
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onUpdate={handleRaffleUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {!address ? (
              <div className="glass-strong glow-border rounded-3xl p-16 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">
                  Connect your wallet
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Connect your wallet to view raffles you've created or entered
                </p>
                <WalletConnect />
              </div>
            ) : isLoading || isCheckingEnteredRaffles ? (
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
                  {filteredEnteredRaffles.length === 0 ? (
                    <div className="glass-strong glow-border rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground">
                        {enteredRaffles.length === 0
                          ? "You haven't entered any raffles yet"
                          : `No raffles found in "${selectedCategory}" category`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredEnteredRaffles.map((raffle) => (
                        <RaffleCard
                          key={raffle.id}
                          raffle={raffle}
                          onUpdate={handleRaffleUpdate}
                        />
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
                      <p className="text-muted-foreground mb-6">
                        {selectedCategory === "All"
                          ? "You haven't created any raffles yet"
                          : `No raffles found in "${selectedCategory}" category`}
                      </p>
                      {selectedCategory === "All" && (
                        <CreateRaffleDialog onSuccess={handleRaffleUpdate} />
                      )}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {createdRaffles.map((raffle) => (
                        <RaffleCard
                          key={raffle.id}
                          raffle={raffle}
                          onUpdate={handleRaffleUpdate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
