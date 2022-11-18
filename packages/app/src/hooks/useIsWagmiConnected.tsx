import React from "react";
import { useAccount } from "wagmi";

export const useIsWalletConnected = () => {
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);

  const { isConnected } = useAccount();

  React.useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

  return { isWalletConnected };
};
