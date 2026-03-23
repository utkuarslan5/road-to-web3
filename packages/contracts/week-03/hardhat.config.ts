import { defineConfig } from "hardhat/config";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const { TESTNET_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const networks = TESTNET_RPC_URL
  ? {
      polygonAmoy: {
        type: "http" as const,
        url: TESTNET_RPC_URL,
        accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        chainId: 80002,
      },
    }
  : {};

export default defineConfig({
  plugins: [hardhatVerify],
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: { enabled: true, runs: 1000 },
      viaIR: true,
    },
  },
  networks,
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
