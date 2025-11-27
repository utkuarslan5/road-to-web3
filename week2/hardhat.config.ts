import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import { defineConfig } from "hardhat/config";
import type { NetworksUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config();

const networks: NetworksUserConfig = (() => {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl =
    process.env.RPC_URL ||
    (alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : undefined);

  if (!rpcUrl) return {};

  return {
    sepolia: {
      type: "http",
      url: rpcUrl,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  };
})();

export default defineConfig({
  solidity: {
    version: "0.8.28",
  },
  plugins: [hardhatEthers, hardhatMocha],
  networks,
});
