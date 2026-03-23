import { ethers } from "hardhat";

async function main() {
  const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
  const example = await ExampleExternalContract.deploy();
  await example.waitForDeployment();

  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy(await example.getAddress());
  await staker.waitForDeployment();

  console.log("ExampleExternalContract:", await example.getAddress());
  console.log("Staker:", await staker.getAddress());
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
