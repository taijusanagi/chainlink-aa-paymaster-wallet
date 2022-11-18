import { useMemo } from "react";
import { useNetwork } from "wagmi";

import { isChainId } from "../../../contracts/types/ChainId";

export const useConnectedChainId = () => {
  const { chain } = useNetwork();
  const connectedChainId = useMemo(() => {
    if (!chain) {
      return;
    }
    const chainId = String(chain.id);
    if (!isChainId(chainId)) {
      return;
    }
    return chainId;
  }, [chain]);
  return { connectedChainId };
};
