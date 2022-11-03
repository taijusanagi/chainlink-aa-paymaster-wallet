import React from "react";
import { useAccount } from "wagmi";

import { useIsMounted } from "./useIsMounted";

/*
 * This is required when we enable wagmi autoconnect with nextjs
 */
export const useIsWagmiConnected = () => {
  const [isWagmiConnected, setIsWagmiConnected] = React.useState(false);

  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  React.useEffect(() => {
    setIsWagmiConnected(isMounted && isConnected);
  }, [isMounted, isConnected]);

  return { isWagmiConnected };
};
