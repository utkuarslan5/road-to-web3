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

  // Build and deploy using artifacts (no hre.ethers dependency)
  const artifact = await hre.artifacts.readArtifact("ChainBattles");
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`ChainBattles deployed at: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
