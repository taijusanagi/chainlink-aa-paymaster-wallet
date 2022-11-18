/* eslint-disable camelcase */
import { ethers, network } from "hardhat";

import deploymentsJsonFile from "../deployments.json";
import { ChainlinkStripePaymaster__factory } from "../typechain-types";
import { ChainId } from "../types/ChainId";

async function main() {
  const chainId = String(network.config.chainId) as ChainId;
  // this is only for polygon mumbai, no local
  if (chainId !== "80001") {
    throw new Error("chain id invalid");
  }
  console.log("chainId", chainId);
  const signer = await ethers.provider.getSigner();
  const signerAddress = await signer.getAddress(); // this is used for paymaster owner
  console.log("signer", signerAddress);
  const { paymaster } = deploymentsJsonFile;
  console.log("paymaster", paymaster);
  const paymasterContract = ChainlinkStripePaymaster__factory.connect(paymaster, signer);
  const blockNumber = await ethers.provider.getBlockNumber();
  const testPaymentId = `debug-mode-only-for-admin-account-${blockNumber}`; // make it incremental value to pass the validation
  const expectedUri = await paymasterContract.getRequestURI(testPaymentId);
  console.log("expectedUri", expectedUri);
  const tx = await paymasterContract.request(testPaymentId);
  console.log("tx sent", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
