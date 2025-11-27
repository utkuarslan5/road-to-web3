import { expect } from "chai";
import type { Contract, TransactionResponse } from "ethers";
import { network } from "hardhat";

async function deployFixture() {
  const { ethers } = await network.connect();
  const [owner, tipperA, tipperB, receiver] = await ethers.getSigners();
  const BuyMeACoffe = await ethers.getContractFactory("BuyMeACoffe");
  const contract = await BuyMeACoffe.deploy();
  await contract.waitForDeployment();
  return { contract, owner, tipperA, tipperB, receiver, ethers };
}

async function expectRevertWith(promise: Promise<unknown>, errorName: string) {
  try {
    await promise;
    expect.fail(`Expected call to be reverted with ${errorName}`);
  } catch (err) {
    const parsedName =
      // Ethers v6 includes errorName on the thrown error or under info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any)?.errorName ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any)?.info?.errorName ||
      String(err);
    expect(String(parsedName)).to.contain(errorName);
  }
}

async function findEventArgs(contract: Contract, tx: TransactionResponse, eventName: string) {
  const receipt = await tx.wait();
  if (!receipt?.logs) return null;
  const contractAddress = await contract.getAddress();

  for (const log of receipt.logs) {
    if (log.address !== contractAddress) continue;
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === eventName) {
        return parsed.args;
      }
    } catch (err) {
      // Ignore logs that do not belong to this contract
    }
  }
  return null;
}

describe("BuyMeACoffe", () => {
  it("sets the deployer as the initial owner", async () => {
    const { contract, owner } = await deployFixture();
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("records memos and emits NewCoffee events when funded", async () => {
    const { contract, tipperA, ethers } = await deployFixture();
    const value = ethers.parseEther("0.01");

    const tx = await contract
      .connect(tipperA)
      .buyCoffee("Alice", "Great work!", { value });

    const eventArgs = await findEventArgs(contract, tx, "NewCoffee");
    expect(eventArgs?.supporter).to.equal(tipperA.address);
    expect(eventArgs?.value).to.equal(value);
    expect(eventArgs?.name).to.equal("Alice");
    expect(eventArgs?.message).to.equal("Great work!");

    const memos = await contract.memos();
    expect(memos).to.have.length(1);
    expect(memos[0].supporter).to.equal(tipperA.address);
    expect(memos[0].name).to.equal("Alice");
    expect(memos[0].message).to.equal("Great work!");
    expect(Number(memos[0].timestamp)).to.be.greaterThan(0);
  });

  it("rejects zero-value coffees", async () => {
    const { contract, tipperA } = await deployFixture();
    await expectRevertWith(contract.connect(tipperA).buyCoffee("Bob", "Hi there"), "TipTooSmall");
  });

  it("allows the owner to withdraw accumulated tips to any address", async () => {
    const { contract, owner, tipperA, tipperB, receiver, ethers } = await deployFixture();
    const tipOne = ethers.parseEther("0.01");
    const tipTwo = ethers.parseEther("0.02");

    await contract.connect(tipperA).buyCoffee("A", "First", { value: tipOne });
    await contract.connect(tipperB).buyCoffee("B", "Second", { value: tipTwo });

    const receiverBefore = await ethers.provider.getBalance(receiver.address);
    await contract.connect(owner).withdrawTips(receiver.address);
    const receiverAfter = await ethers.provider.getBalance(receiver.address);
    const contractBalance = await ethers.provider.getBalance(await contract.getAddress());

    expect(receiverAfter - receiverBefore).to.equal(tipOne + tipTwo);
    expect(contractBalance).to.equal(0n);
  });

  it("prevents non-owners from withdrawing", async () => {
    const { contract, tipperA } = await deployFixture();
    await expectRevertWith(contract.connect(tipperA).withdrawTips(tipperA.address), "NotOwner");
  });

  it("prevents withdrawals when no tips exist", async () => {
    const { contract, owner } = await deployFixture();
    await expectRevertWith(contract.connect(owner).withdrawTips(owner.address), "NoTips");
  });

  it("lets the owner update the withdraw address", async () => {
    const { contract, owner, receiver } = await deployFixture();
    await contract.connect(owner).updateOwner(receiver.address);
    expect(await contract.owner()).to.equal(receiver.address);
    await expectRevertWith(contract.connect(owner).withdrawTips(owner.address), "NotOwner");
  });
});
