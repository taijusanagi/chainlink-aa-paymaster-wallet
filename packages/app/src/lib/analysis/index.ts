import { BigNumber, constants, ethers } from "ethers";

import { truncate } from "@/lib/utils";

import deployments from "../../../../contracts/deployments.json";

// Note: this is wip functions
export const analysis = async (from: string, to: string, data: string, value: string) => {
  console.log("from", from);
  console.log("to", to);
  console.log("data", data);
  console.log("value", value);
  // mock loading for the demo
  await new Promise((resolve) => {
    const intervalId = setInterval(() => {
      clearInterval(intervalId);
      resolve("ok");
    }, 3000);
  });
  const valueBigNumber = BigNumber.from(value);
  const remainder = valueBigNumber.mod(1e14);
  const valueInEther = ethers.utils.formatEther(valueBigNumber.sub(remainder));
  const general = [`This tx interacts with ${to}`, `sending ${valueInEther} ETH`];
  // This can be checked with contract abi
  // For this hackathon, only test NFT drop mint can be detected
  const method = data === "0x1249c58b" ? "mint()" : "not detected";
  const operation = [`${method} = ${truncate(data, 10, 10)}`];
  // It is better with dry-run with fork chain or integrating to third party analyzer
  // However For this hackathon, I focused on Account Abstraction implementation, so it uses mock data for the demo
  const simulation =
    data === "0x1249c58b" && to === deployments.nftDrop
      ? [`NFT is transfered from ${truncate(constants.AddressZero, 5, 5)} to ${truncate(from, 5, 5)}`]
      : [`event not detected`];
  return {
    general,
    operation,
    simulation,
  };
};
