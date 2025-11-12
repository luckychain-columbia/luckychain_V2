"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { connectWallet, getAccount, shortenAddress, isWeb3Available } from "@/lib/web3"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    checkConnection()

    if (isWeb3Available() && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null)
      })
    } else {
      setShowWarning(true)
    }
  }, [])

  async function checkConnection() {
    const acc = await getAccount()
    setAccount(acc)
  }

  async function handleConnect() {
    if (!isWeb3Available()) {
      setShowWarning(true)
      return
    }

    setIsConnecting(true)
    try {
      const acc = await connectWallet()
      setAccount(acc)
      setShowWarning(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !!account}
        className="glass-strong glow-border font-semibold text-base h-12 px-6 text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
      >
        <Wallet className="mr-2 h-5 w-5" />
        {account ? shortenAddress(account) : isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

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
