"use client"

import { useMemo } from "react"
import { ethers } from "ethers"
import { getContract } from "@/lib/ethers"
import type { WalletState } from "./useWallet"

export function useContract(
  address: string,
  abi: readonly string[],
  wallet: WalletState
) {
  const contract = useMemo(() => {
    if (!address || !abi || !wallet.provider) {
      return null
    }

    const signerOrProvider = wallet.signer || wallet.provider
    return getContract(address, abi, signerOrProvider)
  }, [address, abi, wallet.provider, wallet.signer])

  const sendTransaction = async (
    methodName: string,
    ...args: any[]
  ): Promise<ethers.ContractTransactionResponse> => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    if (!wallet.signer) {
      throw new Error("Wallet not connected")
    }

    // Handle last argument as options (for value, etc.)
    const lastArg = args[args.length - 1]
    const hasOptions = lastArg && typeof lastArg === "object" && !Array.isArray(lastArg) && ("value" in lastArg || "gasLimit" in lastArg)
    
    if (hasOptions) {
      const options = args.pop()
      const tx = await (contract as any)[methodName](...args, options)
      return tx
    } else {
      const tx = await (contract as any)[methodName](...args)
      return tx
    }
  }

  const call = async (methodName: string, ...args: any[]): Promise<any> => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    return await (contract as any)[methodName](...args)
  }

  return {
    contract,
    sendTransaction,
    call,
  }
}

