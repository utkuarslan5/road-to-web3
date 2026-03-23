import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import { defineConfig } from "hardhat/config";
import type { NetworksUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config();

const networks: NetworksUserConfig = (() => {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) return {};

  return {
    external: {
      type: "http",
      url: rpcUrl,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  };
})();

export default defineConfig({
  solidity: {
    version: "0.8.30",
  },
  plugins: [hardhatEthers, hardhatMocha],
  networks,
});
