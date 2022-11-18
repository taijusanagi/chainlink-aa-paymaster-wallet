import {
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { signTypedData } from "@wagmi/core";
import WalletConnect from "@walletconnect/client";
import { convertHexToUtf8 } from "@walletconnect/utils";
import { NextPage } from "next";
import { useState } from "react";
import { AiOutlineQrcode } from "react-icons/ai";
import { useSigner } from "wagmi";

import { Layout } from "@/components/Layout";
import { Unit } from "@/components/Unit";
import { useConnectedChainConfig } from "@/hooks/useConnectedChainConfig";
import { useConnectedChainId } from "@/hooks/useConnectedChainId";
import { useIsWalletConnected } from "@/hooks/useIsWagmiConnected";
import { useLinkWalletAPI } from "@/hooks/uselinkWalletApi";
import { truncate } from "@/lib/utils";

import configJsonFile from "../../config.json";

const HomePage: NextPage = () => {
  const { data: signer } = useSigner();
  const { connectedChainId } = useConnectedChainId();
  const { connectedChainConfig } = useConnectedChainConfig();
  const { openConnectModal } = useConnectModal();

  const { isWalletConnected } = useIsWalletConnected();

  const { linkWalletAddress, linkWalletBalance, bundler, linkWalletAPI, getTransactionHashByRequestID } =
    useLinkWalletAPI();

  const [walletConnectURI, setWalletConnectURI] = useState("");
  const [isWalletConnectConnecting, setIsWalletConnectConnecting] = useState(false);
  const [isWalletConnectSessionEstablished, setIsWalletConnectSessionEstablished] = useState(false);

  const [transactionHash, setTransactionHash] = useState("");

  const qrReaderDisclosure = useDisclosure();

  const processTx = async (from: string, to: string, data: string, value: string, gasLimit?: string) => {
    try {
      console.log("processTx");
    } catch (e) {
      console.error(e);
    }
  };

  const connectWithWalletConnect = async (walletConnectURI: string) => {
    if (!connectedChainId || !signer || !bundler || !linkWalletAPI || !linkWalletAddress) {
      return;
    }

    setIsWalletConnectConnecting(true);
    try {
      let walletConnectConnector = new WalletConnect({
        uri: walletConnectURI,
      });
      if (walletConnectConnector.connected) {
        console.log("kill previous session and recreate session");
        await walletConnectConnector.killSession();
        walletConnectConnector = new WalletConnect({
          uri: walletConnectURI,
        });
      }
      walletConnectConnector.on("session_request", async (error, payload) => {
        console.log("session_request", payload);
        if (error) {
          throw error;
        }
        console.log("approving session");
        walletConnectConnector.approveSession({ chainId: Number(connectedChainId), accounts: [linkWalletAddress] });
        console.log("session approved");
        setIsWalletConnectConnecting(false);
        setIsWalletConnectSessionEstablished(true);
      });
      walletConnectConnector.on("call_request", async (error, payload) => {
        console.log("call_request", payload);
        if (error) {
          throw error;
        }
        if (payload.method === "eth_sendTransaction") {
          console.log("eth_sendTransaction");
          await processTx(
            linkWalletAddress,
            payload.params[0].to,
            payload.params[0].data,
            payload.params[0].value,
            payload.params[0].gas
          );
          walletConnectConnector.approveRequest({
            id: payload.id,
            result: transactionHash,
          });
        }
        if (payload.method === "personal_sign") {
          console.log("personal_sign");
          const message = convertHexToUtf8(payload.params[0]);
          console.log("signing message");
          const signature = await signer.signMessage(message);
          console.log("signature", signature);
          walletConnectConnector.approveRequest({
            id: payload.id,
            result: signature,
          });
        }
        if (payload.method === "eth_signTypedData") {
          console.log("eth_signTypedData");
          console.log("signing message");
          console.log(payload.params[1]);
          const { domain, message: value, types } = JSON.parse(payload.params[1]);
          delete types.EIP712Domain;
          console.log(domain, types, value);
          const signature = await signTypedData({ domain, types, value });
          console.log("signature", signature);
          walletConnectConnector.approveRequest({
            id: payload.id,
            result: signature,
          });
        }
      });
      walletConnectConnector.on("disconnect", (error, payload) => {
        console.log("disconnect", payload);
        if (error) {
          throw error;
        }
        setIsWalletConnectConnecting(false);
        setIsWalletConnectSessionEstablished(false);
      });
    } catch (e) {
      console.error(e);
      setIsWalletConnectConnecting(false);
      setIsWalletConnectSessionEstablished(false);
    }
  };

  return (
    <Layout>
      <Stack spacing="8">
        <VStack>
          <Image src="/assets/hero.png" w="96" mx="auto" alt="logo" />
          <Text textAlign={"center"} fontSize={"md"} fontWeight={"bold"} color={configJsonFile.style.color.accent}>
            {configJsonFile.description}
          </Text>
        </VStack>
        {!isWalletConnected && (
          <VStack>
            <HStack spacing="4">
              <Button
                fontWeight={"bold"}
                variant="secondary"
                onClick={() => window.open(`${configJsonFile.url.github}/blob/main/README.md`, "_blank")}
              >
                Docs
              </Button>
              <Button fontWeight={"bold"} onClick={openConnectModal}>
                Connect Wallet
              </Button>
            </HStack>
          </VStack>
        )}
        {isWalletConnected && connectedChainId && connectedChainConfig && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Unit header={configJsonFile.name}>
              <Stack>
                <Stack spacing="0">
                  <Text fontSize="sm" fontWeight={"bold"} color={configJsonFile.style.color.black.text.secondary}>
                    Address
                  </Text>
                  <Text fontSize="xs" color={configJsonFile.style.color.black.text.secondary}>
                    <Link color={configJsonFile.style.color.link}>{truncate(linkWalletAddress, 16, 16)}</Link>
                  </Text>
                </Stack>
                <Stack spacing="0">
                  <Text fontSize="sm" fontWeight={"bold"} color={configJsonFile.style.color.black.text.secondary}>
                    Onchain Balance
                  </Text>
                  <Text fontSize="xs" color={configJsonFile.style.color.black.text.secondary}>
                    {linkWalletBalance} {connectedChainConfig.currency}
                  </Text>
                </Stack>
                <Stack spacing="4">
                  <Stack spacing="0">
                    <Text fontSize="sm" fontWeight={"bold"} color={configJsonFile.style.color.black.text.secondary}>
                      Remaining Off-chain Gas
                    </Text>
                    <Text fontSize="xs" color={configJsonFile.style.color.black.text.secondary}>
                      0 USD
                    </Text>
                  </Stack>
                  <Button>Pay by Stripe</Button>
                </Stack>
              </Stack>
            </Unit>
            <Unit header={"Wallet Connect"} position="relative">
              <Flex position="absolute" top="0" right="0" p="4">
                <Text fontSize="xs" fontWeight={"bold"}>
                  <Icon
                    as={AiOutlineQrcode}
                    aria-label="qrcode"
                    color="blue.500"
                    w={6}
                    h={6}
                    cursor="pointer"
                    onClick={qrReaderDisclosure.onOpen}
                  />
                </Text>
              </Flex>
              <Stack>
                <Input
                  placeholder={"Paste wc: uri"}
                  type={"text"}
                  value={walletConnectURI}
                  fontSize="xs"
                  onChange={(e) => setWalletConnectURI(e.target.value)}
                  disabled={isWalletConnectConnecting || isWalletConnectSessionEstablished}
                />
                <Button
                  onClick={() => connectWithWalletConnect(walletConnectURI)}
                  isLoading={isWalletConnectConnecting}
                  disabled={isWalletConnectSessionEstablished}
                >
                  {!isWalletConnectSessionEstablished ? "Connect" : "Connected"}
                </Button>
              </Stack>
            </Unit>
          </SimpleGrid>
        )}
      </Stack>
    </Layout>
  );
};

export default HomePage;
