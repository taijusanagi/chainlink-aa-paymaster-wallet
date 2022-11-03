import { ethers } from "hardhat";

async function main() {
  const NFTDrop = await ethers.getContractFactory("NFTDrop");
  const nftDrop = await NFTDrop.deploy();
  await nftDrop.deployed();
  console.log("NFTDrop deployed", nftDrop.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
