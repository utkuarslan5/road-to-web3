import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const getBalance = async (address) => {
    // Fetch current balance (wei) for the address from provider
    const balanceBigInt = await ethers.provider.getBalance(address);
    return ethers.formatEther(balanceBigInt);
  };

  const printBalances = async (addresses) => {
    // Display balances for each tracked address to follow ETH flow
    let idx = 0;
    for (const address of addresses) {
      console.log(`Address ${idx} balance:`, await getBalance(address));
      idx += 1;
    }
  };

  const printMemos = async (memos) => {
    // Iterate stored memos and log supporter notes
    for (const memo of memos) {
      const timestamp = Number(memo.timestamp);
      const tipper = memo.name;
      const tipperAddress = memo.supporter;
      const message = memo.message;
      console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
    }
  };

  // Grab demo accounts from the Hardhat node
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

  // Deploy a fresh contract so the script is self-contained
  const BuyMeACoffe = await ethers.getContractFactory("BuyMeACoffe");
  const buyMeACoffe = await BuyMeACoffe.deploy();
  await buyMeACoffe.waitForDeployment();

  const contractAddress = await buyMeACoffe.getAddress();
  console.log("BuyMeACoffe deployed to:", contractAddress);

  const addresses = [owner.address, tipper.address, contractAddress];
  console.log("== start ==");
  await printBalances(addresses);

  const tip = { value: ethers.parseEther("1") };
  // Each supporter buys a coffee with a memo
  await buyMeACoffe.connect(tipper).buyCoffee("Carolina", "You're the best!", tip);
  await buyMeACoffe.connect(tipper2).buyCoffee("Vitto", "Amazing teacher", tip);
  await buyMeACoffe.connect(tipper3).buyCoffee("Kay", "I love my Proof of Knowledge", tip);

  console.log("== bought coffee ==");
  await printBalances(addresses);

  // Owner withdraws accumulated tips
  await buyMeACoffe.connect(owner).withdrawTips(owner.address);

  console.log("== withdrawTips ==");
  await printBalances(addresses);

  console.log("== memos ==");
  const memos = await buyMeACoffe.memos();
  await printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
