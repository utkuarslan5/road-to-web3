import { defineConfig } from "hardhat/config";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const { TESTNET_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

export default defineConfig({
  plugins: [hardhatVerify],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    polygonAmoy: {
      type: "http",
      url: TESTNET_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY || "",
      customChains: [
        {
          network: "polygonAmoy",
          chainId: 80002,
          urls: {
            apiURL: "https://api-amoy.polygonscan.com/api",
            browserURL: "https://amoy.polygonscan.com",
          },
        },
      ],
    },
    blockscout: { enabled: false },
    sourcify: { enabled: false },
  },
});
