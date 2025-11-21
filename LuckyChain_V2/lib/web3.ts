import { ethers } from "ethers";

// Contract address - set via environment variable or use default
export const RAFFLE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// Check if Web3 is available (EIP-1193 provider)
export function isWeb3Available(): boolean {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
}

// Check if contract is deployed at the given address
export async function isContractDeployed(
  address: string,
  provider: ethers.Provider
): Promise<boolean> {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return false;
  }
  try {
    const code = await provider.getCode(address);
    return code !== "0x" && code !== "0x0";
  } catch {
    return false;
  }
}

// Helper function to identify wallet by provider properties
export const getWalletName = (provider: any): string | null => {
  if (!provider) return null;

  // Check for MetaMask
  if (provider.isMetaMask && !provider.isBraveWallet) {
    return "MetaMask";
  }

  // Check for Coinbase Wallet
  if (provider.isCoinbaseWallet) {
    return "Coinbase Wallet";
  }

  // Check for Brave Wallet
  if (provider.isBraveWallet) {
    return "Brave Wallet";
  }

  // Check for Trust Wallet
  if (provider.isTrust) {
    return "Trust Wallet";
  }

  // Check for Rainbow Wallet
  if (provider.isRainbow) {
    return "Rainbow Wallet";
  }

  // Check for Phantom (Ethereum)
  if (provider.isPhantom) {
    return "Phantom";
  }

  // Generic Web3 provider
  if (provider.request && typeof provider.request === "function") {
    return "Web3 Wallet";
  }

  return null;
};

// Optional: Network switching function (from old version)
const switchNetwork = async () => {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  // "0x7a69" is 31337 in hex (Hardhat Localhost)
  if (chainId !== "0x7a69") {
    try {
      // switching to Hardhat Localhost
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }],
      });
      console.log("Switched to Hardhat Localhost (chainId 31337)");
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
        });
      } else {
        throw switchError;
      }
    }
  }
};
