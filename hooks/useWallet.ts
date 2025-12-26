"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { getProvider, ensureCorrectNetwork, resetProvider } from "@/lib/ethers"
import type { ChainConfig } from "@/config/chains"

export interface WalletState {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

// Helper to check if error is a message port error
function isMessagePortError(error: any): boolean {
  return (
    error?.message?.includes("message port closed") ||
    error?.message?.includes("The message port closed") ||
    error?.code === "UNPREDICTABLE_GAS_LIMIT"
  )
}

export function useWallet(chainConfig?: ChainConfig) {
  const [state, setState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  })

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not installed",
        isConnecting: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error("Provider not available")
      }

      // Request account access with error handling
      try {
        await provider.send("eth_requestAccounts", [])
      } catch (error: any) {
        if (isMessagePortError(error)) {
          // Reset provider and retry once
          resetProvider()
          const retryProvider = getProvider()
          if (retryProvider) {
            await retryProvider.send("eth_requestAccounts", [])
          } else {
            throw new Error("MetaMask connection interrupted. Please try again.")
          }
        } else {
          throw error
        }
      }

      // Switch network if chain config provided
      if (chainConfig) {
        await ensureCorrectNetwork(
          provider,
          chainConfig.chainId,
          chainConfig.chainIdHex,
          chainConfig.chainName,
          chainConfig.rpcUrl
        )
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setState({
        address,
        provider,
        signer,
        isConnected: true,
        isConnecting: false,
        error: null,
      })
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to connect wallet",
        isConnecting: false,
      }))
    }
  }, [chainConfig])

  const disconnect = useCallback(() => {
    setState({
      address: null,
      provider: null,
      signer: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    })
  }, [])

  // Check if already connected on mount
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      return
    }

    const checkConnection = async () => {
      try {
        const provider = getProvider()
        if (!provider) return

        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()

          if (chainConfig) {
            await ensureCorrectNetwork(
              provider,
              chainConfig.chainId,
              chainConfig.chainIdHex,
              chainConfig.chainName,
              chainConfig.rpcUrl
            )
          }

          setState({
            address,
            provider,
            signer,
            isConnected: true,
            isConnecting: false,
            error: null,
          })
        }
      } catch (error: any) {
        // Silently handle message port errors on initial check
        if (!isMessagePortError(error)) {
          // Only log non-port errors for debugging
          console.debug("Wallet connection check failed:", error)
        }
      }
    }

    // Add a small delay to avoid race conditions on page load
    const timeoutId = setTimeout(() => {
      checkConnection()
    }, 100)

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        // Reset provider on account change to ensure fresh connection
        resetProvider()
        checkConnection()
      }
    }

    // Listen for chain changes
    const handleChainChanged = () => {
      resetProvider()
      checkConnection()
    }

    const ethereum = (window as any).ethereum
    ethereum?.on("accountsChanged", handleAccountsChanged)
    ethereum?.on("chainChanged", handleChainChanged)

    return () => {
      clearTimeout(timeoutId)
      ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [chainConfig, disconnect])

  return {
    ...state,
    connect,
    disconnect,
  }
}

