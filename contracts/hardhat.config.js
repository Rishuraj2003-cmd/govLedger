require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x59c6995e998f97a5a0044966f09453879c5e98ed0a4b7d1f2c6e55f5d5b0a5f6";

const networks = {
  localhost: {
    url: "http://127.0.0.1:8545",
  },
  hardhat: {},
};

if (process.env.RPC_URL) {
  networks.amoy = {
    url: process.env.RPC_URL,
    accounts: [PRIVATE_KEY],
  };
}

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
};
