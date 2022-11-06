import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";

import * as dotenv from "dotenv";
import fs from "fs";
import { HardhatUserConfig } from "hardhat/config";

import rpc from "./config/rpc.json";

dotenv.config();

const mnemonicFileName = "../../mnemonic.txt";
let mnemonic = "test ".repeat(11) + "junk";
if (fs.existsSync(mnemonicFileName)) {
  mnemonic = fs.readFileSync("../../mnemonic.txt", "ascii").trim();
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
      },
      {
        version: "0.8.15",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic,
      },
    },
    goerli: {
      url: rpc.goerli,
      accounts: {
        mnemonic,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
