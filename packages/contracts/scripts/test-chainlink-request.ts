/* eslint-disable camelcase */
import { ethers, network } from "hardhat";

import deploymentsJsonFile from "../deployments.json";
import networkJsonFile from "../network.json";
import {
  ChainlinkStripePaymaster__factory,
  EntryPoint__factory,
  IERC20__factory,
  LinkWalletDeployer__factory,
} from "../typechain-types";
import { ChainId } from "../types/ChainId";

async function main() {
  const chainId = String(network.config.chainId) as ChainId;
  // if (chainId !== "80001") {
  //   throw new Error("chain id invalid");
  // }

  const signer = await ethers.provider.getSigner();
  const signerAddress = await signer.getAddress(); // this is used for paymaster owner

  console.log("signer", signerAddress);

  const { paymaster } = deploymentsJsonFile;

  const paymasterContract = ChainlinkStripePaymaster__factory.connect(paymaster, signer);
  const testSubscriptionId = "debug";
  paymasterContract.request(testSubscriptionId);

  console.log(link, oracle, priceFeed, paymaster);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});