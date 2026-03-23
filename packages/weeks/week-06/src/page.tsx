"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { ethers } from "ethers"
import {
  AlertCircle,
  Banknote,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Wallet,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EXAMPLE_EXTERNAL_CONTRACT_ABI,
  Input,
  Label,
  STAKER_ABI,
  WEEK6_CONFIG,
  ZERO_ADDRESS,
  extractErrorMessage,
  getContract,
  truncateAddress,
  useToast,
  useWallet,
} from "@road/shared"

type Week6Snapshot = {
  staker: string
  stakedAt: bigint
  stakeDeadline: bigint
  withdrawDeadline: bigint
  stakedAmount: bigint
  withdrawn: boolean
  rewardPerBlock: bigint
  secondsPerBlock: bigint
  reward: bigint
  withdrawableAmount: bigint
  contractBalance: bigint
  exampleExternalContract: string
  exampleContractReady: boolean
  exampleCompleted: boolean
  exampleCompletedAt: bigint
  exampleTotalReceived: bigint
}

const blockTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatTimestamp(timestamp: bigint | number | null | undefined): string {
  if (!timestamp) return "Not set"
  return blockTimeFormatter.format(new Date(Number(timestamp) * 1000))
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "closed"

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatEth(value: bigint): string {
  const formatted = ethers.formatEther(value)
  return formatted.includes(".") ? formatted.replace(/\.?0+$/, "") : formatted
}

function isZeroAddress(address: string) {
  return address === ZERO_ADDRESS
}

export default function Week06Page() {
  const wallet = useWallet(WEEK6_CONFIG)
  const { toast } = useToast()
  const [readProvider] = useState(() => new ethers.JsonRpcProvider(WEEK6_CONFIG.rpcUrl))
  const [stakeAmount, setStakeAmount] = useState<string>(WEEK6_CONFIG.defaultStakeEth)
  const [snapshot, setSnapshot] = useState<Week6Snapshot | null>(null)
  const [deploymentWarning, setDeploymentWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<"stake" | "withdraw" | "lock" | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  const provider = wallet.provider ?? readProvider

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSnapshot() {
      setError(null)
      setDeploymentWarning(null)

      try {
        const block = await provider.getBlock("latest")
        if (!cancelled && block?.timestamp) {
          setNow(Number(block.timestamp))
        }

        if (isZeroAddress(WEEK6_CONFIG.contractAddress)) {
          if (!cancelled) {
            setSnapshot(null)
            setDeploymentWarning(
              "Week 6 is still using a zero-address placeholder. Deploy the Staker contract and update apps/web/lib/config/contracts.ts to enable transactions."
            )
          }
          return
        }

        const code = await provider.getCode(WEEK6_CONFIG.contractAddress)
        if (code === "0x") {
          if (!cancelled) {
            setSnapshot(null)
            setDeploymentWarning(
              `No contract bytecode found at ${WEEK6_CONFIG.contractAddress}. Deploy Staker before using the staking UI.`
            )
          }
          return
        }

        const stakerContract = getContract(WEEK6_CONFIG.contractAddress, STAKER_ABI, provider)
        const contractBalance = await provider.getBalance(WEEK6_CONFIG.contractAddress)
        const [
          exampleExternalContract,
          staker,
          stakedAt,
          stakeDeadline,
          withdrawDeadline,
          stakedAmount,
          withdrawn,
          rewardPerBlock,
          secondsPerBlock,
          reward,
          withdrawableAmount,
        ] = await Promise.all([
          stakerContract.exampleExternalContract() as Promise<string>,
          stakerContract.staker() as Promise<string>,
          stakerContract.stakedAt() as Promise<bigint>,
          stakerContract.stakeDeadline() as Promise<bigint>,
          stakerContract.withdrawDeadline() as Promise<bigint>,
          stakerContract.stakedAmount() as Promise<bigint>,
          stakerContract.withdrawn() as Promise<boolean>,
          stakerContract.REWARD_PER_BLOCK() as Promise<bigint>,
          stakerContract.SECONDS_PER_BLOCK() as Promise<bigint>,
          stakerContract.calculateReward() as Promise<bigint>,
          stakerContract.withdrawableAmount() as Promise<bigint>,
        ])

        let exampleCompleted = false
        let exampleCompletedAt = 0n
        let exampleTotalReceived = 0n
        let exampleContractReady = false
        const resolvedExampleAddress = !isZeroAddress(exampleExternalContract)
          ? exampleExternalContract
          : WEEK6_CONFIG.exampleExternalContractAddress

        if (!isZeroAddress(resolvedExampleAddress)) {
          const exampleCode = await provider.getCode(resolvedExampleAddress)
          if (exampleCode !== "0x") {
            exampleContractReady = true
            const exampleContract = getContract(resolvedExampleAddress, EXAMPLE_EXTERNAL_CONTRACT_ABI, provider)
            exampleCompleted = await exampleContract.completed()
            exampleCompletedAt = await exampleContract.completedAt()
            exampleTotalReceived = await exampleContract.totalReceived()
          }
        }

        if (!cancelled) {
          setSnapshot({
            staker,
            stakedAt,
            stakeDeadline,
            withdrawDeadline,
            stakedAmount,
            withdrawn,
            rewardPerBlock,
            secondsPerBlock,
            reward,
            withdrawableAmount,
            contractBalance,
            exampleExternalContract: resolvedExampleAddress,
            exampleContractReady,
            exampleCompleted,
            exampleCompletedAt,
            exampleTotalReceived,
          })
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(extractErrorMessage(loadError))
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [provider, refreshKey])

  const stakeDeadline = snapshot ? Number(snapshot.stakeDeadline) : 0
  const withdrawDeadline = snapshot ? Number(snapshot.withdrawDeadline) : 0
  const stakeWindowOpen = snapshot ? now < stakeDeadline : false
  const withdrawWindowOpen = snapshot ? now >= stakeDeadline && now < withdrawDeadline : false
  const lockWindowOpen = snapshot ? now >= withdrawDeadline : false
  const hasStake = snapshot ? snapshot.stakedAmount > 0n : false
  const withdrawFunded = snapshot ? snapshot.contractBalance >= snapshot.withdrawableAmount : false
  const canStake = Boolean(snapshot) && stakeWindowOpen && !hasStake && !snapshot?.withdrawn
  const canWithdraw = Boolean(snapshot) && withdrawWindowOpen && hasStake && !snapshot?.withdrawn && withdrawFunded
  const canLock =
    snapshot !== null &&
    lockWindowOpen &&
    snapshot.contractBalance > 0n &&
    snapshot.exampleContractReady &&
    !snapshot.exampleCompleted
  const deployed = !isZeroAddress(WEEK6_CONFIG.contractAddress) && Boolean(snapshot)
  const isLoading = !snapshot && !deploymentWarning && !error

  async function runWalletAction(
    action: "stake" | "withdraw" | "lock",
    txFactory: () => Promise<ethers.ContractTransactionResponse>,
    successTitle: string,
    successDescription: string
  ) {
    if (!wallet.isConnected) {
      await wallet.connect()
      return
    }

    setPendingAction(action)

    try {
      const tx = await txFactory()
      toast({
        title: "Transaction sent",
        description: "Waiting for confirmation...",
      })
      await tx.wait()
      toast({
        title: successTitle,
        description: successDescription,
      })
      setRefreshKey((prev: number) => prev + 1)
    } catch (actionError) {
      toast({
        title: "Transaction failed",
        description: extractErrorMessage(actionError),
        variant: "destructive",
      })
    } finally {
      setPendingAction(null)
    }
  }

  async function handleStakeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canStake) {
      toast({
        title: "Stake unavailable",
        description: "The staking window is closed or this cycle is already locked.",
        variant: "destructive",
      })
      return
    }

    const normalizedAmount = stakeAmount.trim()
    if (!normalizedAmount) {
      toast({
        title: "Missing amount",
        description: "Enter an ETH amount before staking.",
        variant: "destructive",
      })
      return
    }

    let parsedAmount: bigint
    try {
      parsedAmount = ethers.parseEther(normalizedAmount)
    } catch {
      toast({
        title: "Invalid amount",
        description: "Use a valid ETH amount like 0.01.",
        variant: "destructive",
      })
      return
    }

    if (parsedAmount <= 0n) {
      toast({
        title: "Invalid amount",
        description: "Stake amount must be greater than zero.",
        variant: "destructive",
      })
      return
    }

    const stakerContract = getContract(WEEK6_CONFIG.contractAddress, STAKER_ABI, wallet.signer || wallet.provider || provider)

    await runWalletAction(
      "stake",
      () => stakerContract.stake({ value: parsedAmount }),
      "Stake confirmed",
      `Locked ${ethers.formatEther(parsedAmount)} ETH into the Staker contract.`
    )
  }

  async function handleWithdraw() {
    if (!canWithdraw) {
      toast({
        title: "Withdraw unavailable",
        description: withdrawWindowOpen
          ? "The contract does not currently have enough balance to cover the payout."
          : "Withdrawals are only available after the stake window closes and before the lock window starts.",
        variant: "destructive",
      })
      return
    }

    const stakerContract = getContract(WEEK6_CONFIG.contractAddress, STAKER_ABI, wallet.signer || wallet.provider || provider)

    await runWalletAction(
      "withdraw",
      () => stakerContract.withdraw(),
      "Withdrawal confirmed",
      `Released ${ethers.formatEther(snapshot?.withdrawableAmount ?? 0n)} ETH back to the staker.`
    )
  }

  async function handleLockFunds() {
    if (!canLock) {
      toast({
        title: "Lock unavailable",
        description: "Funds can only be locked after the withdraw window closes, while the contract still holds balance, and after the external contract is ready.",
        variant: "destructive",
      })
      return
    }

    const stakerContract = getContract(WEEK6_CONFIG.contractAddress, STAKER_ABI, wallet.signer || wallet.provider || provider)

    await runWalletAction(
      "lock",
      () => stakerContract.lockFundsInExternalContract(),
      "Funds locked",
      "Transferred the remaining contract balance into the external completion contract."
    )
  }

  const stakeCountdown = snapshot ? formatCountdown(stakeDeadline - now) : "n/a"
  const withdrawCountdown = snapshot ? formatCountdown(withdrawDeadline - now) : "n/a"

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Badge variant="default">Week 6</Badge>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isLoading ? "secondary" : deployed ? "success" : "destructive"}>
              {isLoading ? "LOADING" : deployed ? "READY" : "NOT DEPLOYED"}
            </Badge>
            <Badge variant="secondary">Sepolia</Badge>
            {wallet.isConnected && wallet.address && (
              <Badge variant="outline">Connected: {truncateAddress(wallet.address)}</Badge>
            )}
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">Staking Application</h1>
        <p className="text-muted-foreground max-w-3xl">
          Stake ETH during the open window, withdraw the payout before the lock period starts, then forward any leftover contract balance into the external completion contract.
        </p>
      </div>

      {(deploymentWarning || error) && (
        <Card className="glass p-6 mb-8 border-dashed">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 mt-1 text-destructive" />
            <div className="space-y-1">
              <h2 className="font-semibold">{deploymentWarning ? "Deployment needed" : "Read error"}</h2>
              <p className="text-sm text-muted-foreground">{deploymentWarning || error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
        <Card className="glass p-0 overflow-hidden">
          <CardHeader className="p-6 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Stake ETH
            </CardTitle>
            <CardDescription>
              This contract is single-cycle. Once it has been used, the stake cannot be repeated without redeploying.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleStakeSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="stake-amount" className="font-mono text-xs tracking-wider uppercase">
                  Amount (ETH)
                </Label>
                <Input
                  id="stake-amount"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={stakeAmount}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setStakeAmount(event.target.value)}
                  placeholder={WEEK6_CONFIG.defaultStakeEth}
                  className="font-mono"
                  disabled={!canStake || pendingAction !== null || !deployed}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Button
                  type="submit"
                  disabled={!deployed || pendingAction === "stake" || !canStake}
                  className="w-full"
                >
                  {pendingAction === "stake" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Staking
                    </>
                  ) : !wallet.isConnected ? (
                    <>
                      <Wallet className="h-4 w-4" />
                      Connect wallet
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Stake ETH
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleWithdraw}
                  disabled={!deployed || pendingAction === "withdraw" || !canWithdraw}
                  className="w-full"
                >
                  {pendingAction === "withdraw" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Withdrawing
                    </>
                  ) : (
                    <>
                      <Clock3 className="h-4 w-4" />
                      Withdraw
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLockFunds}
                  disabled={!deployed || pendingAction === "lock" || !canLock}
                  className="w-full"
                >
                  {pendingAction === "lock" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Locking
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Lock funds
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground space-y-1">
                <p>Wallet: {wallet.isConnected ? "Connected" : "Not connected"}</p>
                <p>Stake window: {stakeWindowOpen ? `open for ${stakeCountdown}` : "closed"}</p>
                <p>Withdraw window: {withdrawWindowOpen ? `open for ${withdrawCountdown}` : lockWindowOpen ? "closed" : `opens in ${withdrawCountdown}`}</p>
                <p>Withdrawal funding: {snapshot ? (withdrawFunded ? "ready" : "insufficient contract balance") : "loading"}</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <CardTitle className="text-xl">Live State</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRefreshKey((prev: number) => prev + 1)}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Cycle</span>
                <Badge variant={isLoading ? "secondary" : stakeWindowOpen ? "success" : withdrawWindowOpen ? "secondary" : "destructive"}>
                  {isLoading ? "Loading" : stakeWindowOpen ? "Stake open" : withdrawWindowOpen ? "Withdraw open" : "Locked"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Staker</span>
                <span className="font-mono">{snapshot ? truncateAddress(snapshot.staker) : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Staked amount</span>
                <span className="font-mono">{snapshot ? `${formatEth(snapshot.stakedAmount)} ETH` : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Withdrawable</span>
                <span className="font-mono">{snapshot ? `${formatEth(snapshot.withdrawableAmount)} ETH` : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Contract balance</span>
                <span className="font-mono">{snapshot ? `${formatEth(snapshot.contractBalance)} ETH` : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Reward per block</span>
                <span className="font-mono">{snapshot ? `${formatEth(snapshot.rewardPerBlock)} ETH` : "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <CardTitle className="text-xl mb-4">Contract Details</CardTitle>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Staker contract</p>
                {deployed ? (
                  <Link
                    href={`${WEEK6_CONFIG.explorer}/address/${WEEK6_CONFIG.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {truncateAddress(WEEK6_CONFIG.contractAddress)}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <p className="font-mono text-muted-foreground">0x0000000000000000000000000000000000000000</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">External contract</p>
                {snapshot && snapshot.exampleContractReady ? (
                  <Link
                    href={`${WEEK6_CONFIG.explorer}/address/${snapshot.exampleExternalContract}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {truncateAddress(snapshot.exampleExternalContract)}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <p className="text-muted-foreground">
                    {snapshot && !isZeroAddress(snapshot.exampleExternalContract) ? "Missing bytecode" : "Not configured yet"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground mb-1">Stake deadline</p>
                  <p className="font-mono text-xs">{snapshot ? formatTimestamp(snapshot.stakeDeadline) : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Withdraw deadline</p>
                  <p className="font-mono text-xs">{snapshot ? formatTimestamp(snapshot.withdrawDeadline) : "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Lock state</p>
                <p className="flex items-center gap-2">
                  {canLock ? <ShieldCheck className="h-4 w-4 text-neon-green" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                  {canLock
                    ? "Funds can be locked into the external contract."
                    : "Locking requires a funded contract, a closed withdraw window, and a ready external contract."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass p-6">
          <CardTitle className="text-xl mb-4">How It Works</CardTitle>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-neon-green shrink-0" />
              Connect a wallet on Sepolia, then stake ETH during the open window.
            </li>
            <li className="flex gap-3">
              <Clock3 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              Withdraw is only allowed after the stake window closes and before the lock window starts.
            </li>
            <li className="flex gap-3">
              <Lock className="h-4 w-4 mt-0.5 text-week2 shrink-0" />
              When the window closes, any remaining contract balance can be forwarded to the external completion contract.
            </li>
          </ul>
        </Card>

        <Card className="glass p-6">
          <CardTitle className="text-xl mb-4">On-Chain Numbers</CardTitle>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Staked at</p>
              <p>{snapshot ? formatTimestamp(snapshot.stakedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Withdrawn</p>
              <p>{snapshot ? (snapshot.withdrawn ? "Yes" : "No") : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Seconds per block</p>
              <p className="font-mono">{snapshot ? snapshot.secondsPerBlock.toString() : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Example contract</p>
              <p>{snapshot ? (snapshot.exampleCompleted ? "Completed" : "Pending") : "—"}</p>
            </div>
          </div>
          {snapshot && snapshot.exampleCompleted && (
            <div className="mt-4 rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
              External contract completed at {formatTimestamp(snapshot.exampleCompletedAt)} and received {formatEth(snapshot.exampleTotalReceived)} ETH.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
