import dotenv from "dotenv";
import hre from "hardhat";
import { ethers } from "ethers";

dotenv.config();

async function main() {
  const networkName = hre.network?.name ?? "Polygon Amoy Testnet";
  console.log(`Deploying ChainBattles to '${networkName}'...`);

  // Resolve RPC + signer
  const rpcUrl = process.env.TESTNET_RPC_URL;


  const pk =
    process.env.PRIVATE_KEY;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Wallet balance: ${ethers.formatEther(balance)} MATIC`);
  console.log(`Wallet address: ${wallet.address}`);

  // Build and deploy using artifacts (no hre.ethers dependency)
  const artifact = await hre.artifacts.readArtifact("ChainBattles");
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Estimate gas first
  try {
    const deployTx = factory.getDeployTransaction();
    const gasEstimate = await provider.estimateGas(deployTx);
    console.log(`Estimated gas: ${gasEstimate.toString()}`);
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    console.log(`Gas price: ${ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} gwei`);
    
    const estimatedCost = gasEstimate * (feeData.gasPrice || 0n);
    console.log(`Estimated cost: ${ethers.formatEther(estimatedCost)} MATIC`);
  } catch (error) {
    console.log(`Gas estimation failed: ${error.message}`);
  }

  console.log("Deploying contract...");
  const contract = await factory.deploy();
  console.log("Transaction sent, waiting for deployment...");
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ ChainBattles deployed at: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
