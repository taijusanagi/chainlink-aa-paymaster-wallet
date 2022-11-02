/* eslint-disable camelcase */
import { EntryPoint__factory } from "@account-abstraction/contracts";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import { DeterministicDeployer } from "../lib/infinitism/DeterministicDeployer";
import { CapsuleWalletDeployer__factory } from "../typechain-types";

async function main() {
  const argument = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [1, 1]);
  const entryPointCreationCode = ethers.utils.solidityPack(
    ["bytes", "bytes"],
    [EntryPoint__factory.bytecode, argument]
  );
  const entryPointAddress = await DeterministicDeployer.deploy(entryPointCreationCode);
  const factoryAddress = await DeterministicDeployer.deploy(CapsuleWalletDeployer__factory.bytecode);
  const result = {
    entryPoint: entryPointAddress,
    factory: factoryAddress,
  };
  fs.writeFileSync(path.join(__dirname, `../deployments.json`), JSON.stringify(result));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
