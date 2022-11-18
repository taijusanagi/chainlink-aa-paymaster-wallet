/* eslint-disable camelcase */
import { EntryPoint__factory } from "@account-abstraction/contracts";
import fs from "fs";
import { ethers, network } from "hardhat";
import path from "path";

import { BASE_URI, JOB_ID, SUBSCRIPTION_FEE_IN_USD } from "../config";
import { DeterministicDeployer } from "../lib/infinitism/DeterministicDeployer";
import networkJsonFile from "../network.json";
import { ADDRESS_1 } from "../test/helper/dummy";
import { ChainlinkStripePaymaster__factory, LinkWalletDeployer__factory } from "../typechain-types";
import { ChainId } from "../types/ChainId";

async function main() {
  const chainId = String(network.config.chainId) as ChainId;
  // if (chainId !== "80001") {
  //   throw new Error("chain id invalid");
  // }

  const signer = await ethers.provider.getSigner();
  const signerAddress = await signer.getAddress(); // this is used for paymaster owner

  console.log("signer", signerAddress);

  let link = "";
  let oracle = "";
  let priceFeed = "";
  if (chainId === "80001") {
    link = networkJsonFile[chainId].contracts.link;
    oracle = networkJsonFile[chainId].contracts.oracle;
    priceFeed = networkJsonFile[chainId].contracts.priceFeed;
  } else {
    // this is dummy data for local
    // it is hard to set up local mock environment for chainlink
    // so only tested on Polygon Mumbai
    link = ADDRESS_1;
    oracle = ADDRESS_1;
    priceFeed = ADDRESS_1;
  }

  const argument = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [1, 1]);
  const entryPointCreationCode = ethers.utils.solidityPack(
    ["bytes", "bytes"],
    [EntryPoint__factory.bytecode, argument]
  );
  const entryPointAddress = await DeterministicDeployer.deploy(entryPointCreationCode);
  const factoryAddress = await DeterministicDeployer.deploy(LinkWalletDeployer__factory.bytecode);

  const deployPaymasterArgument = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address", "address", "address", "bytes32", "uint256", "string"],
    // this address data is dummy for local testing
    [entryPointAddress, signerAddress, link, oracle, priceFeed, JOB_ID, SUBSCRIPTION_FEE_IN_USD, BASE_URI]
  );
  const paymasterCreationCode = ethers.utils.solidityPack(
    ["bytes", "bytes"],
    [ChainlinkStripePaymaster__factory.bytecode, deployPaymasterArgument]
  );
  const paymasterAddress = await DeterministicDeployer.deploy(paymasterCreationCode);
  const result = {
    entryPoint: entryPointAddress,
    factory: factoryAddress,
    paymaster: paymasterAddress,
  };
  fs.writeFileSync(path.join(__dirname, `../deployments.json`), JSON.stringify(result));

  console.log("deployement done", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
