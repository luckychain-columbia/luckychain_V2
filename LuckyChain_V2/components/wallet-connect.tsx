"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/app/utils"
import { Wallet, AlertCircle, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/app/context/Web3Context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function WalletConnect() {
  const { account, connectWallet, disconnectWallet, isConnecting, availableWallets, selectWallet } = useWeb3()
  const [showWarning, setShowWarning] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)

  useEffect(() => {
    // Only show warning if no wallet is installed AND no account is connected
    if (typeof window.ethereum === "undefined" && !account) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [account])

  async function handleConnect() {
    try {
      // If multiple wallets are available, show selection dialog
      if (availableWallets.length > 1) {
        setShowWalletDialog(true)
        return
      }
      
      // Single wallet or no wallets detected - use default connection
      await connectWallet()
      setShowWarning(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setShowWarning(true)
    }
  }

  async function handleSelectWallet(wallet: typeof availableWallets[0]) {
    try {
      setShowWalletDialog(false)
      await selectWallet(wallet)
      setShowWarning(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setShowWarning(true)
    }
  }

  function handleDisconnect() {
    disconnectWallet()
    setShowWarning(false)
  }

  return (
    <>
      <div className="relative flex items-center group">
        {account ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDisconnect}
              className="glass-strong glow-border font-semibold text-base h-12 px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              variant="outline"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Disconnect
            </Button>
            <Button
              disabled
              className="glass-strong glow-border font-semibold text-base h-12 px-6 text-white opacity-75 cursor-default"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {shortenAddress(account)}
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="glass-strong glow-border font-semibold text-base h-12 px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 relative"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
              {showWarning && typeof window.ethereum === "undefined" && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-black/90 animate-pulse" title="No Web3 wallet detected" />
              )}
            </Button>
            {showWarning && typeof window.ethereum === "undefined" && (
              <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <Alert className="glass-strong glow-border border-destructive/50 max-w-[160px] shadow-lg py-1.5 px-2 text-[10px] !grid-cols-[auto_1fr] !gap-x-1.5 bg-black/95 backdrop-blur-sm rounded-lg">
                  <AlertCircle className="h-2.5 w-2.5 text-destructive flex-shrink-0 !translate-y-0 mt-0.5" />
                  <AlertDescription className="text-[10px] leading-tight text-muted-foreground !col-start-2 py-0">
                    Install a Web3 wallet to interact with the blockchain.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}
      </div>

      {/* Wallet Selection Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="glass-strong glow-border border-primary/40 bg-black/90 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Select Wallet</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Multiple wallets detected. Choose which wallet you'd like to connect:
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
  )
}
