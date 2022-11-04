/* eslint-disable camelcase */
import { EntryPoint__factory } from "@account-abstraction/contracts";
import { ethers } from "ethers";

import deployments from "../../../../contracts/deployments.json";
import { NFTDrop__factory } from "../../../../contracts/typechain-types";

export const getNFTDropMintFunctionData = () => {
  const nftDrop = NFTDrop__factory.createInterface();
  return nftDrop.encodeFunctionData("mint");
};
