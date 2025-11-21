"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import { Wallet, LogOut } from "lucide-react";
import { useWeb3 } from "@/app/context/Web3Context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WalletConnect() {
  const {
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
    availableWallets,
    selectWallet,
  } = useWeb3();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  async function handleConnect() {
    try {
      // If multiple wallets are available, show selection dialog
      if (availableWallets.length > 1) {
        setShowWalletDialog(true);
        return;
      }

      // Single wallet or no wallets detected - use default connection
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  async function handleSelectWallet(wallet: (typeof availableWallets)[0]) {
    try {
      setShowWalletDialog(false);
      await selectWallet(wallet);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  function handleDisconnect() {
    disconnectWallet();
  }

  return (
    <>
      <div className="flex items-center">
        {account ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDisconnect}
              className="glass-strong glow-border font-semibold text-xs md:text-base h-9 md:h-12 px-3 md:px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              variant="outline"
            >
              <LogOut className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Disconnect</span>
              <span className="sm:hidden">Disc</span>
            </Button>
            <Button
              disabled
              className="glass-strong glow-border font-semibold text-xs md:text-base h-9 md:h-12 px-3 md:px-6 text-white opacity-75 cursor-default"
            >
              <Wallet className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              {shortenAddress(account)}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="glass-strong glow-border font-semibold text-xs md:text-base h-9 md:h-12 px-3 md:px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            <Wallet className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </span>
            <span className="sm:hidden">
              {isConnecting ? "..." : "Connect"}
            </span>
          </Button>
        )}
      </div>

      {/* Wallet Selection Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="glass-strong glow-border border-primary/40 bg-black/90 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Select Wallet
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Multiple wallets detected. Choose which wallet you'd like to
              connect:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {availableWallets.map((wallet, index) => (
              <Button
                key={index}
                onClick={() => handleSelectWallet(wallet)}
                className="w-full glass-strong glow-border justify-start h-auto py-4 px-4 text-left hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                variant="outline"
              >
                <Wallet className="mr-3 h-5 w-5" />
                <div className="flex-1">
                  <div className="font-semibold text-base">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Click to connect with {wallet.name}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
