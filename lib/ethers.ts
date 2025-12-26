// Ethers.js helpers

import { ethers } from "ethers"

export function ensureEthers(): void {
  if (typeof window === "undefined") {
    throw new Error("Ethers.js can only be used in browser environment")
  }
}

export async function ensureCorrectNetwork(
  provider: ethers.BrowserProvider,
  chainId: bigint,
  chainIdHex: string,
  chainName: string,
  rpcUrl: string
): Promise<void> {
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
      } else {
        throw switchError
      }
    }
  }
}

export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return null
  }
  return new ethers.BrowserProvider((window as any).ethereum)
}

export function getContract(
  address: string,
  abi: readonly string[],
  provider: ethers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(address, abi, provider)
}

