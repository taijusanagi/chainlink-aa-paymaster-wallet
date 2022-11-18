/* eslint-disable camelcase */
import { ethers, network } from "hardhat";

import deploymentsJsonFile from "../deployments.json";
import networkJsonFile from "../network.json";
import { ChainlinkStripePaymaster__factory, IERC20__factory } from "../typechain-types";
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
  const { link } = networkJsonFile[chainId].contracts;
  console.log("link", link);
  const { paymaster } = deploymentsJsonFile;
  console.log("paymaster", paymaster);
  const linkTokenContract = IERC20__factory.connect(link, signer);
  const paymasterContract = ChainlinkStripePaymaster__factory.connect(paymaster, signer);

  // paymaster stake & deposit
  // this is required because paymaster pay gas fee for user

  // let's set less amount for testing, testnet token is hard to get
  const depositTx = await paymasterContract.deposit({ value: ethers.utils.parseEther("0.1") });
  console.log("depositTx:", depositTx.hash);
  await depositTx.wait();
  const addStakeTx = await paymasterContract.addStake(0, { value: ethers.utils.parseEther("0.1") });
  console.log("addStakeTx:", addStakeTx.hash);
  await addStakeTx.wait();

  // link deposit
  // this is required to use chainlink

  const transferTx = await linkTokenContract.transfer(paymaster, ethers.utils.parseEther("0.1"));
  console.log("transferTx:", transferTx.hash);
  await transferTx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
