"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { getWalletName } from "@/lib/web3";

// Web3 Context for wallet connection management
// Based on old version structure with improvements

interface WalletProvider {
  provider: any;
  name: string;
  icon?: string;
}

interface Web3ContextType {
  account: string | null; // The user's wallet address (e.g., "0x123...")
  connectWallet: () => Promise<void>; // Function to connect to a Web3 wallet
  disconnectWallet: () => void; // Function to disconnect wallet
  provider: BrowserProvider | null; // The ethers.js provider to interact with blockchain
  isConnecting: boolean; // Loading state for connection
  availableWallets: WalletProvider[]; // List of available wallet providers
  selectWallet: (wallet: WalletProvider) => Promise<void>; // Function to select a specific wallet
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  provider: null,
  isConnecting: false,
  availableWallets: [],
  selectWallet: async () => {},
});

// Custom hook to use this context easily in other components
export const useWeb3 = () => useContext(Web3Context);

// Helper function to detect available wallet providers
function detectWallets(): WalletProvider[] {
  const wallets: WalletProvider[] = [];

  if (typeof window === "undefined") {
    return wallets;
  }

  // Check for window.ethereum (EIP-1193 standard)
  if (window.ethereum) {
    // Check if it's an array of providers (multiple wallets)
    if (Array.isArray(window.ethereum.providers)) {
      window.ethereum.providers.forEach((provider: any) => {
        const name = getWalletName(provider);
        wallets.push({ provider, name: name || "Web3 Wallet" });
      });
    } else {
      // Single provider - check which wallet it is
      const name = getWalletName(window.ethereum);
      wallets.push({ provider: window.ethereum, name: name || "Web3 Wallet" });
    }
  }

  return wallets;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>(
    []
  );
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Detect available wallets on mount
  useEffect(() => {
    const wallets = detectWallets();
    setAvailableWallets(wallets);

    // If only one wallet, auto-select it
    if (wallets.length >= 1) {
      setSelectedProvider(wallets[0].provider);
    }
  }, []);

  // Function to connect using a specific provider
  const connectWithProvider = async (ethereumProvider: any) => {
    if (!ethereumProvider || typeof ethereumProvider.request !== "function") {
      alert("Invalid wallet provider. Please try a different wallet.");
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      const accounts: string[] = await ethereumProvider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No accounts returned. Please unlock your wallet and try again."
        );
      }

      const firstAccount = accounts[0];
      if (!firstAccount) {
        throw new Error(
          "Received an invalid account from the wallet provider."
        );
      }

      const browserProvider = new BrowserProvider(ethereumProvider);

      setAccount(firstAccount);
      setProvider(browserProvider);
      setSelectedProvider(ethereumProvider);

      console.log("Connected to wallet:", firstAccount);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if ((error as any)?.code === 4001) {
        alert("Wallet connection was rejected.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
      setAccount(null);
      setProvider(null);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to select a specific wallet
  const selectWallet = async (wallet: WalletProvider) => {
    await connectWithProvider(wallet.provider);
  };

  // Function to connect to a Web3 wallet
  const connectWallet = async () => {
    // Check if any Web3 wallet is installed
    if (typeof window.ethereum === "undefined") {
      alert("Please install a Web3 wallet (like MetaMask) to use LuckyChain!");
      return;
    }

    // Use the selected provider or default to window.ethereum
    // Note: Wallet selection dialog is handled in wallet-connect component
    const providerToUse = selectedProvider || window.ethereum;
    await connectWithProvider(providerToUse);
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  // Listen for account changes (when user switches accounts in their wallet)
  useEffect(() => {
    const ethereumProvider = selectedProvider || window.ethereum;
    if (!ethereumProvider) return;

    let provider: BrowserProvider | null = null;

    const isWalletUnlocked = async () => {
      const isUnlockedFn = ethereumProvider._metamask?.isUnlocked;
      return typeof isUnlockedFn === "function" ? isUnlockedFn() : true;
    };

    const applyAccounts = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }

      // Ensure wallet is unlocked (MetaMask only)
      if (!(await isWalletUnlocked())) {
        disconnectWallet();
        return;
      }

      setAccount(accounts[0]);

      // Only recreate providers when necessary
      provider = new BrowserProvider(ethereumProvider);
      setProvider(provider);
    };

    const syncAccounts = async () => {
      try {
        const accounts = await ethereumProvider.request({
          method: "eth_accounts",
        });
        await applyAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        disconnectWallet();
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      applyAccounts(accounts);
    };

    // Register listener
    ethereumProvider.on("accountsChanged", handleAccountsChanged);

    // Initial sync
    syncAccounts();

    // Cleanup
    return () => {
      if (typeof ethereumProvider.removeListener === "function") {
        ethereumProvider.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [selectedProvider]);

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        provider,
        isConnecting,
        availableWallets,
        selectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

// TypeScript declaration for Web3 wallet's ethereum provider (EIP-1193)
declare global {
  interface Window {
    ethereum?: any;
  }
}
