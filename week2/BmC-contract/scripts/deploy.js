import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const BuyMeACoffe = await ethers.getContractFactory("BuyMeACoffe");
  const buyMeACoffe = await BuyMeACoffe.deploy();
  await buyMeACoffe.waitForDeployment();

  console.log("BuyMeACoffe deployed to:", await buyMeACoffe.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
