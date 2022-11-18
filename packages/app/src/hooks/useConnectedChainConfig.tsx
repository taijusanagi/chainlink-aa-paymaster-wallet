import { useConnectedChainId } from "./useConnectedChainId";
import { useSelectedChainConfig } from "./useSelectedChainConfig";

export const useConnectedChainConfig = () => {
  const { connectedChainId } = useConnectedChainId();
  const { selectedChainConfig } = useSelectedChainConfig(connectedChainId);
  return { connectedChainConfig: selectedChainConfig };
};
