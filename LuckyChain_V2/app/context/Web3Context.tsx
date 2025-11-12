"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { BrowserProvider } from "ethers"

// Web3 Context for wallet connection management
// Based on old version structure with improvements

interface Web3ContextType {
  account: string | null // The user's wallet address (e.g., "0x123...")
  connectWallet: () => Promise<void> // Function to connect to MetaMask
  disconnectWallet: () => void // Function to disconnect wallet
  provider: BrowserProvider | null // The ethers.js provider to interact with blockchain
  isConnecting: boolean // Loading state for connection
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  provider: null,
  isConnecting: false,
})

// Custom hook to use this context easily in other components
export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Function to connect to MetaMask
  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      
      // Check if MetaMask is installed (it injects "ethereum" into window)
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to use LuckyChain!")
        return
      }

      // Optional: Switch network (commented out - uncomment if needed)
      // await switchNetwork()

      // Request account access. MetaMask will prompt the user (asks them to unlock if needed).
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned. Please unlock your wallet and try again.")
      }

      const firstAccount = accounts[0]
      if (!firstAccount) {
        throw new Error("Received an invalid account from the wallet provider.")
      }

      const browserProvider = new BrowserProvider(window.ethereum)

      setAccount(firstAccount)
      setProvider(browserProvider)

      console.log("Connected to wallet:", firstAccount)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      if ((error as any)?.code === 4001) {
        alert("Wallet connection was rejected.")
      } else {
        alert("Failed to connect wallet. Please try again.")
      }
      setAccount(null)
      setProvider(null)
    } finally {
      setIsConnecting(false)
    }
  }

  // Optional: Network switching function (from old version)
  // Uncomment and configure if you need automatic network switching
  /*
  const switchNetwork = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    // "0x7a69" is 31337 in hex (Hardhat Localhost)
    if (chainId !== "0x7a69") {
      try {
        // switching to Hardhat Localhost
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7a69" }],
        })
        console.log("Switched to Hardhat Localhost (chainId 31337)")
      } catch (switchError: any) {
        // If not added, add the network manually
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7a69", // 31337 in hex
                chainName: "Hardhat Localhost",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          })
        } else {
          throw switchError
        }
      }
    }
  }
  */

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
  }

  // Listen for account changes (when user switches accounts in MetaMask)
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const applyAccounts = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
          return
        }

        const isUnlockedFn = window.ethereum._metamask?.isUnlocked
        if (typeof isUnlockedFn === "function") {
          const unlocked = await isUnlockedFn()
          if (!unlocked) {
            disconnectWallet()
            return
          }
        }

        setAccount(accounts[0])
        setProvider(new BrowserProvider(window.ethereum))
      }

      const handleAccountsChanged = (accounts: string[]) => {
        void applyAccounts(accounts)
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      const syncAccounts = async () => {
        try {
          const accounts: string[] = await window.ethereum.request({
            method: "eth_accounts",
          })
          await applyAccounts(accounts)
        } catch (error) {
          console.error("Error checking accounts:", error)
          disconnectWallet()
        }
      }

      void syncAccounts()

      // Cleanup listener when component unmounts
      return () => {
        if (typeof window.ethereum !== "undefined") {
          window.ethereum.removeAllListeners("accountsChanged")
        }
      }
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{ account, connectWallet, disconnectWallet, provider, isConnecting }}
    >
      {children}
    </Web3Context.Provider>
  )
}

// TypeScript declaration for MetaMask's ethereum object
declare global {
  interface Window {
    ethereum?: any
  }
}

