import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ignition-viem";
import "dotenv/config";

const TESTNET_PRIVATE_KEY = vars.get("TESTNET_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    liskSepolia: {
      url: `https://rpc.sepolia-api.lisk.com`,
      accounts: [TESTNET_PRIVATE_KEY],
    },
    liskMainnet: {
      url: `https://rpc.api.lisk.com`,
      accounts: [TESTNET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      liskSepolia: "random-api-key",
      liskMainnet: "random-api-key",
    },
    customChains: [
      {
        network: "liskMainnet",
        chainId: 1135,
        urls: {
          apiURL: "https://blockscout.lisk.com/api",
          browserURL: "https://blockscout.lisk.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;