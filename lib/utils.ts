import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return ""
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatEther(value: bigint | string): string {
  const num = typeof value === "string" ? BigInt(value) : value
  const divisor = BigInt(10 ** 18)
  const whole = num / divisor
  const remainder = num % divisor
  const decimals = remainder.toString().padStart(18, "0")
  const trimmed = decimals.replace(/\.?0+$/, "")
  return `${whole}.${trimmed}`
}

export function parseEther(value: string): bigint {
  const [whole, decimals = ""] = value.split(".")
  const padded = decimals.padEnd(18, "0").slice(0, 18)
  return BigInt(whole) * BigInt(10 ** 18) + BigInt(padded || "0")
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }
  if (error && typeof error === "object" && "reason" in error) {
    return String(error.reason)
  }
  return "An unknown error occurred"
}

