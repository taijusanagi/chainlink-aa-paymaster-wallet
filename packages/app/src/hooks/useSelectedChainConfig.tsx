import { useMemo } from "react";

import networkJsonFile from "../../../contracts/network.json";
import { ChainId } from "../../../contracts/types/ChainId";

export const useSelectedChainConfig = (chainId?: ChainId) => {
  const selectedChainConfig = useMemo(() => {
    if (!chainId) {
      return;
    }
    return networkJsonFile[chainId];
  }, [chainId]);
  return { selectedChainConfig };
};
