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
        if (name) {
          wallets.push({ provider, name });
        }
      });
    } else {
      // Single provider - check which wallet it is
      const name = getWalletName(window.ethereum);
      if (name) {
        wallets.push({ provider: window.ethereum, name });
      } else {
        // Unknown provider, but still valid
        wallets.push({ provider: window.ethereum, name: "Web3 Wallet" });
      }
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
    if (wallets.length === 1) {
      setSelectedProvider(wallets[0].provider);
    } else if (
      wallets.length > 1 &&
      window.ethereum &&
      !Array.isArray(window.ethereum.providers)
    ) {
      // Multiple wallets but window.ethereum is not an array - use the default one
      setSelectedProvider(window.ethereum);
    }
  }, []);

  // Function to connect using a specific provider
  const connectWithProvider = async (ethereumProvider: any) => {
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
    setAccount(null);
    setProvider(null);
  };

  // Listen for account changes (when user switches accounts in their wallet)
  useEffect(() => {
    const ethereumProvider = selectedProvider || window.ethereum;

    if (typeof ethereumProvider !== "undefined" && ethereumProvider) {
      const applyAccounts = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
          return;
        }

        // Check if wallet is unlocked (MetaMask specific check)
        const isUnlockedFn = ethereumProvider._metamask?.isUnlocked;
        if (typeof isUnlockedFn === "function") {
          const unlocked = await isUnlockedFn();
          if (!unlocked) {
            disconnectWallet();
            return;
          }
        }

        setAccount(accounts[0]);
        setProvider(new BrowserProvider(ethereumProvider));
      };

      const handleAccountsChanged = (accounts: string[]) => {
        void applyAccounts(accounts);
      };

      ethereumProvider.on("accountsChanged", handleAccountsChanged);

      const syncAccounts = async () => {
        try {
          const accounts: string[] = await ethereumProvider.request({
            method: "eth_accounts",
          });
          await applyAccounts(accounts);
        } catch (error) {
          console.error("Error checking accounts:", error);
          disconnectWallet();
        }
      };

      void syncAccounts();

      // Cleanup listener when component unmounts
      return () => {
        if (
          ethereumProvider &&
          typeof ethereumProvider.removeAllListeners === "function"
        ) {
          ethereumProvider.removeAllListeners("accountsChanged");
        }
      };
    }
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
