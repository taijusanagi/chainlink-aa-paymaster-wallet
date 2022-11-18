import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import networkJsonFile from "../../../../contracts/network.json";

const supportedChains: Chain[] = Object.entries(networkJsonFile).map(([chainId, network]) => {
  return {
    id: Number(chainId),
    name: network.name,
    network: network.key,
    nativeCurrency: {
      decimals: 18,
      name: network.currency,
      symbol: network.currency,
    },
    rpcUrls: {
      default: network.rpc,
    },
    blockExplorers: {
      default: { name: network.explorer.tx.name, url: network.explorer.tx.url },
    },
    testnet: true,
  };
});

const { chains, provider } = configureChains([...supportedChains], [publicProvider()]);

export interface RainbowWeb3AuthConnectorProps {
  chains: Chain[];
}

const { connectors } = getDefaultWallets({
  appName: "NFTHashi",
  chains,
});

export { chains };

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
