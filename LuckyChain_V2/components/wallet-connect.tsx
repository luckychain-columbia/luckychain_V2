"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/app/utils"
import { Wallet, AlertCircle, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/app/context/Web3Context"

export function WalletConnect() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check if MetaMask is available
    if (typeof window.ethereum === "undefined") {
      setShowWarning(true)
    }
  }, [])

  async function handleConnect() {
    try {
      await connectWallet()
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
    <div className="flex flex-col items-end gap-3">
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
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="glass-strong glow-border font-semibold text-base h-12 px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}

      {showWarning && !account && (
        <Alert className="glass-strong glow-border border-destructive/50 max-w-sm shadow-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs leading-relaxed">
            Install MetaMask to interact with the blockchain. Currently viewing demo mode.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
