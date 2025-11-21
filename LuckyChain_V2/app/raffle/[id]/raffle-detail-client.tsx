"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RaffleCard } from "@/components/raffle-card";
import { RaffleCardSkeleton } from "@/components/raffle-card-skeleton";
import { Trophy, ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/app/context/Web3Context";
import useContract from "@/hooks/use-contract";
import { ContractRaffle } from "@/app/types";
import { shortenAddress, getTimeRemaining, getRaffleUrl } from "@/lib/utils";
import { formatEther } from "ethers/utils";

interface RaffleDetailClientProps {
  raffleId: number;
}

export function RaffleDetailClient({ raffleId }: RaffleDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [raffle, setRaffle] = useState<ContractRaffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { account } = useWeb3();
  const { loadRaffles } = useContract();

  const loadRaffle = useCallback(async () => {
    if (raffleId === null || isNaN(raffleId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const raffles = await loadRaffles();
      const foundRaffle = raffles.find((r) => r.id === raffleId);
      if (foundRaffle) {
        setRaffle(foundRaffle);
      } else {
        toast({
          title: "Raffle not found",
          description: `Raffle #${raffleId} does not exist.`,
          variant: "destructive",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to load raffle:", error);
      toast({
        title: "Error",
        description: "Failed to load raffle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [raffleId, loadRaffles, toast, router]);

  useEffect(() => {
    loadRaffle();

    // Refresh raffle periodically
    const interval = setInterval(() => {
      loadRaffle();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadRaffle]);

  const handleCopyLink = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = getRaffleUrl(raffleId);
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Raffle link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [raffleId, toast]);

  const handleShare = useCallback(() => {
    if (typeof window !== "undefined" && navigator.share) {
      const url = getRaffleUrl(raffleId);
      navigator
        .share({
          title: raffle?.title || "LuckyChain Raffle",
          text: `Check out this raffle: ${raffle?.title}`,
          url: url,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          // Fallback to copy link
          handleCopyLink();
        });
    } else {
      // Fallback to copy link if Web Share API is not available
      handleCopyLink();
    }
  }, [raffleId, raffle, handleCopyLink]);

  const timeRemaining = useMemo(() => {
    if (!raffle || raffle.isCompleted) return "Ended";
    const endTime = Number(raffle.endTime ?? 0);
    return getTimeRemaining(endTime);
  }, [raffle]);

  const isActive = useMemo(() => {
    if (!raffle) return false;
    if (!raffle.isActive || raffle.isCompleted) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const endTimestamp = Number(raffle.endTime ?? 0);
    return endTimestamp === 0 || endTimestamp > nowSeconds;
  }, [raffle]);

  const handleRaffleUpdate = useCallback(() => {
    loadRaffle();
  }, [loadRaffle]);

  if (isLoading) {
    return (
      <section className="relative">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button
                variant="outline"
                className="mb-8 glass-strong glow-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Raffles
              </Button>
            </Link>

            <RaffleCardSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (!raffle) {
    return (
      <section className="relative">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button
                variant="outline"
                className="mb-8 glass-strong glow-border"
              >
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
    );
  }

  return (
    <section className="relative">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
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
                {isActive
                  ? "Active"
                  : raffle.isCompleted
                  ? "Completed"
                  : "Ended"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Raffle ID</p>
                <p className="font-semibold">#{raffle.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Creator</p>
                <p className="font-semibold font-mono">
                  {shortenAddress(raffle.creator)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-semibold">{timeRemaining}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pool</p>
                <p className="font-semibold">
                  {formatEther(raffle.totalPool ?? BigInt(0))} ETH
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
