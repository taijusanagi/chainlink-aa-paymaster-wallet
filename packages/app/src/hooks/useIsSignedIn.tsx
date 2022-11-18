import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

import { compareInLowerCase } from "@/lib/utils";

export const useIsSignedIn = () => {
  const { disconnect } = useDisconnect();
  const { address: connectedAddress } = useAccount();
  const { data: session } = useSession();
  const [isSignedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!disconnect || !connectedAddress || !session) {
      setSignedIn(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _session = session as any;
    const sessionAddress = _session.address;
    if (!compareInLowerCase(connectedAddress, sessionAddress)) {
      if (connectedAddress) {
        disconnect();
      }
      return;
    }
    setSignedIn(true);
  }, [disconnect, session, connectedAddress]);

  return { isSignedIn };
};
