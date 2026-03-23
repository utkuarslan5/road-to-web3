// Centralized error handling utilities

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = "NETWORK",
  CONTRACT = "CONTRACT",
  WALLET = "WALLET",
  API = "API",
  UNKNOWN = "UNKNOWN",
}

/**
 * Check if error is a message port error (MetaMask connection issues)
 */
export function isMessagePortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  
  const err = error as Record<string, unknown>
  return (
    (typeof err.message === "string" && (
      err.message.includes("message port closed") ||
      err.message.includes("The message port closed")
    )) ||
    err.code === "UNPREDICTABLE_GAS_LIMIT"
  )
}

/**
 * Check if error is a cooldown error
 */
export function isCooldownError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase()
  const cooldownPatterns = [/cooldown/i, /cooldownactive/i, /wait.*before/i, /not ready/i]
  return cooldownPatterns.some(pattern => pattern.test(message))
}

/**
 * Check if error is an insufficient funds error
 */
export function isInsufficientFundsError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase()
  const patterns = [/insufficient funds/i, /insufficient balance/i]
  return patterns.some(pattern => pattern.test(message))
}

/**
 * Check if error is a contract revert error
 */
export function isContractRevertError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase()
  return (
    message.includes("execution reverted") ||
    message.includes("require") ||
    message.includes("revert")
  )
}

/**
 * Extract error message from various error types
 * Standardizes error message extraction across the codebase
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === "string") {
    return error
  }
  
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>
    
    // Try common error message properties
    if (typeof err.message === "string") {
      return err.message
    }
    
    if (typeof err.reason === "string") {
      return err.reason
    }
    
    if (typeof err.error === "string") {
      return err.error
    }
    
    // For error objects with nested message
    if (err.error && typeof err.error === "object") {
      const nestedError = err.error as Record<string, unknown>
      if (typeof nestedError.message === "string") {
        return nestedError.message
      }
    }
  }
  
  return "An unknown error occurred"
}

/**
 * Get user-friendly error message
 * Converts technical errors into user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: unknown, context?: string): string {
  const message = extractErrorMessage(error)
  
  // Handle specific error patterns
  if (isMessagePortError(error)) {
    return "Wallet connection interrupted. Please try again."
  }
  
  if (isCooldownError(error)) {
    return "Action is on cooldown. Please wait before trying again."
  }
  
  if (isInsufficientFundsError(error)) {
    return "Insufficient funds to complete this transaction."
  }
  
  if (isContractRevertError(error) && message.includes("TokenDoesNotExist")) {
    return "Token does not exist."
  }
  
  if (isContractRevertError(error) && message.includes("NotTokenOwner")) {
    return "You are not the owner of this token."
  }
  
  if (isContractRevertError(error) && message.includes("CooldownActive")) {
    return "Action is on cooldown. Please wait before trying again."
  }
  
  // For contract errors, try to extract meaningful parts
  if (message.includes("execution reverted")) {
    // Try to extract custom error messages
    const revertMatch = message.match(/execution reverted:?\s*([^\n]+)/i)
    if (revertMatch && revertMatch[1]) {
      return revertMatch[1].trim()
    }
    return context ? `${context} failed. Please try again.` : "Transaction failed. Please try again."
  }
  
  // Return original message if we can't make it more friendly
  return message
}

/**
 * Categorize error for better error handling
 */
export function categorizeError(error: unknown): ErrorCategory {
  const message = extractErrorMessage(error).toLowerCase()
  
  if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
    return ErrorCategory.NETWORK
  }
  
  if (message.includes("contract") || message.includes("revert") || message.includes("execution")) {
    return ErrorCategory.CONTRACT
  }
  
  if (message.includes("wallet") || message.includes("metamask") || isMessagePortError(error)) {
    return ErrorCategory.WALLET
  }
  
  if (message.includes("api") || message.includes("http") || message.includes("404") || message.includes("500")) {
    return ErrorCategory.API
  }
  
  return ErrorCategory.UNKNOWN
}

