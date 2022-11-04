/* eslint-disable camelcase */
import { ethers } from "ethers";

import metadata from "../../../../../data/metadata.json";
import deployments from "../../../../contracts/deployments.json";
import { NFTDrop__factory } from "../../../../contracts/typechain-types";

export const getNFTDropMintFunctionData = () => {
  const nftDrop = NFTDrop__factory.createInterface();
  return nftDrop.encodeFunctionData("mint");
};

export const getDroppedNFTsByOwner = async (provider: ethers.providers.Provider, owner: string) => {
  const nftDrop = NFTDrop__factory.connect(deployments.nftDrop, provider);
  const balance = await nftDrop.balanceOf(owner);
  const promises = [];
  for (let i = 0; balance.gt(i); i++) {
    promises.push(nftDrop.tokenOfOwnerByIndex(owner, i));
  }
  const tokenIds = await Promise.all(promises);
  return tokenIds.map((tokenId) => {
    return {
      // This is ok because it is only showing test NFT drop assets
      ...metadata,
      tokenId: tokenId.toString(),
      image: "./img/nft.png",
    };
  });
};
