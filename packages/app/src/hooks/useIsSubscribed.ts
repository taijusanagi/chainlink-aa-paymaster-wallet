import { useEffect, useState } from "react";

import { useIsSignedIn } from "./useIsSignedIn";

export const useIsSubscribed = () => {
  const { isSignedIn } = useIsSignedIn();

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsSubscribed(false);
      return;
    }
    fetch("/api/stripe/user-subscription-status", {
      method: "POST",
    })
      .then(async (res) => {
        const { status, message } = await res.json();
        console.log(message);
        if (status) {
          setIsSubscribed(true);
        }
      })
      .catch(() => {
        setIsSubscribed(false);
        console.log("user is not subscribed the offchain gas payment");
      });
  }, [isSignedIn]);

  return { isSubscribed };
};
