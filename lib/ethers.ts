// Ethers.js helpers

import { ethers } from "ethers"

export function ensureEthers(): void {
  if (typeof window === "undefined") {
    throw new Error("Ethers.js can only be used in browser environment")
  }
}

// Helper to check if error is a message port error
function isMessagePortError(error: any): boolean {
  return (
    error?.message?.includes("message port closed") ||
    error?.message?.includes("The message port closed") ||
    error?.code === "UNPREDICTABLE_GAS_LIMIT" // Sometimes related to port issues
  )
}

export async function ensureCorrectNetwork(
  provider: ethers.BrowserProvider,
  chainId: bigint,
  chainIdHex: string,
  chainName: string,
  rpcUrl: string
): Promise<void> {
  try {
    const network = await provider.getNetwork()
    
    if (network.chainId !== chainId) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName,
                  rpcUrls: [rpcUrl],
                },
              ],
            })
          } catch (addError) {
            throw new Error(`Failed to add ${chainName} network`)
          }
        } else if (isMessagePortError(switchError)) {
          // Silently handle message port errors - they're usually transient
          console.warn("MetaMask connection interrupted during network switch")
          return
        } else {
          throw switchError
        }
      }
    }
  } catch (error: any) {
    if (isMessagePortError(error)) {
      console.warn("MetaMask connection interrupted during network check")
      return
    }
    throw error
  }
}

// Singleton provider instance to avoid multiple connections
let providerInstance: ethers.BrowserProvider | null = null

export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return null
  }
  
  // Return existing instance if available and ethereum object hasn't changed
  if (providerInstance) {
    return providerInstance
  }
  
  try {
    providerInstance = new ethers.BrowserProvider((window as any).ethereum)
    return providerInstance
  } catch (error: any) {
    if (isMessagePortError(error)) {
      console.warn("MetaMask connection interrupted, will retry on next call")
      // Reset instance so it can be retried
      providerInstance = null
      return null
    }
    throw error
  }
}

// Reset provider instance (useful for testing or when MetaMask is reloaded)
export function resetProvider(): void {
  providerInstance = null
}

export function getContract(
  address: string,
  abi: readonly string[],
  provider: ethers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(address, abi, provider)
}

