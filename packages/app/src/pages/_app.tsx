import "@rainbow-me/rainbowkit/styles.css";
import "@fontsource/inter/variable.css";

import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { WagmiConfig } from "wagmi";

import { myChakraUITheme, myRainbowKitTheme } from "@/lib/theme";
import { chains, wagmiClient } from "@/lib/wallet";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider resetCSS theme={myChakraUITheme}>
      <WagmiConfig client={wagmiClient}>
        <SessionProvider session={pageProps.session}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider chains={chains} showRecentTransactions={true} theme={myRainbowKitTheme}>
              <Component {...pageProps} />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </SessionProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
};

export default MyApp;
