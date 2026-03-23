"use client"

import { useMemo } from "react"
import type { ethers } from "ethers"
import { getContract } from "@/lib/ethers"
import type { WalletState, ContractTransactionOptions } from "@/types/ethers"

export interface UseContractReturn {
  contract: ethers.Contract | null
  sendTransaction: (methodName: string, ...args: unknown[]) => Promise<ethers.ContractTransactionResponse>
  call: <T = unknown>(methodName: string, ...args: unknown[]) => Promise<T>
}

export function useContract(
  address: string,
  abi: readonly string[],
  wallet: WalletState
): UseContractReturn {
  const contract = useMemo(() => {
    if (!address || !abi || !wallet.provider) {
      return null
    }

    const signerOrProvider = wallet.signer || wallet.provider
    return getContract(address, abi, signerOrProvider)
  }, [address, abi, wallet.provider, wallet.signer])

  const sendTransaction = async (
    methodName: string,
    ...args: unknown[]
  ): Promise<ethers.ContractTransactionResponse> => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    if (!wallet.signer) {
      throw new Error("Wallet not connected")
    }

    // Handle last argument as options (for value, etc.)
    const lastArg = args[args.length - 1]
    const hasOptions = 
      lastArg && 
      typeof lastArg === "object" && 
      !Array.isArray(lastArg) && 
      (lastArg as ContractTransactionOptions).value !== undefined || 
      (lastArg as ContractTransactionOptions).gasLimit !== undefined
    
    if (hasOptions) {
      const options = args.pop() as ContractTransactionOptions
      const contractMethod = contract[methodName as keyof typeof contract] as (...args: unknown[]) => Promise<ethers.ContractTransactionResponse>
      return await contractMethod(...args, options)
    } else {
      const contractMethod = contract[methodName as keyof typeof contract] as (...args: unknown[]) => Promise<ethers.ContractTransactionResponse>
      return await contractMethod(...args)
    }
  }

  const call = async <T = unknown>(methodName: string, ...args: unknown[]): Promise<T> => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    const contractMethod = contract[methodName as keyof typeof contract] as (...args: unknown[]) => Promise<T>
    return await contractMethod(...args)
  }

  return {
    contract,
    sendTransaction,
    call,
  }
}

