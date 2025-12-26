"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { getProvider, ensureCorrectNetwork } from "@/lib/ethers"
import type { ChainConfig } from "@/config/chains"

export interface WalletState {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
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

      // Request account access
      await provider.send("eth_requestAccounts", [])

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
      } catch (error) {
        // Silently fail on initial check
      }
    }

    checkConnection()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        checkConnection()
      }
    }

    ;(window as any).ethereum?.on("accountsChanged", handleAccountsChanged)

    return () => {
      ;(window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [chainConfig, disconnect])

  return {
    ...state,
    connect,
    disconnect,
  }
}

