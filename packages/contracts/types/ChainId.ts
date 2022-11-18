import networkJsonFile from "../network.json";

export type ChainId = keyof typeof networkJsonFile;

export const isChainId = (chainId: string): chainId is ChainId => {
  return Object.keys(networkJsonFile).includes(chainId);
};
