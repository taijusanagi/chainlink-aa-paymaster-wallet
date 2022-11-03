import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import WalletConnect from "@walletconnect/client";
import { convertHexToUtf8 } from "@walletconnect/utils";
import { NextPage } from "next";
import { useState } from "react";
import { AiOutlineDown, AiOutlinePlus, AiOutlineQrcode } from "react-icons/ai";

import { FullModal, GeneralModal } from "@/components/elements/Modal";
import { DefaultLayout } from "@/components/layouts/Default";
import { CHAIN_ID } from "@/config";
import { useCapsuleWalletAPI } from "@/hooks/useCapsuleWalletApi";
import { truncate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrReader = require("react-qr-scanner");

const HomePage: NextPage = () => {
  /*
   * Hooks
   */
  const { capsuleWalletAddress } = useCapsuleWalletAPI();
  const paymasterDisclosure = useDisclosure();
  const qrReaderDisclosure = useDisclosure();
  const [walletConnectURI, setWalletConnectURI] = useState("");

  const [isWalletConnectConnecting, setIsWalletConnectConnecting] = useState(false);
  const [isWalletConnectSessionEstablished, setIsWalletConnectSessionEstablished] = useState(false);
  /*
   * Functions
   */
  const onQRReaderScan = (result: { text: string }) => {
    if (!result) {
      return;
    }
    setWalletConnectURI(result.text);
    qrReaderDisclosure.onClose();
  };

  const onQRReaderError = (err: unknown) => {
    console.error(err);
  };

  const connectWithWalletConnect = async () => {
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
      await walletConnectConnector.createSession();
      walletConnectConnector.on("session_request", (error, payload) => {
        console.log("session_request", payload);
        if (error) {
          throw error;
        }
        console.log("connect", capsuleWalletAddress);
        walletConnectConnector.approveSession({ chainId: CHAIN_ID, accounts: [capsuleWalletAddress] });
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
        }

        if (payload.method === "personal_sign") {
          console.log("personal_sign");
        }
      });
      walletConnectConnector.on("disconnect", (error, payload) => {
        console.log("disconnect", payload);
        if (error) {
          throw error;
        }
      });
    } catch (e) {
      console.error(e);
      setIsWalletConnectConnecting(false);
      setIsWalletConnectSessionEstablished(false);
    }
  };

  return (
    <DefaultLayout>
      <Stack spacing="4">
        <Flex justify={"space-between"}>
          <Stack>
            <Heading fontWeight={"bold"} size={{ base: "xs", md: "sm" }} color="gray.600">
              AA Capsule
            </Heading>
            <Text fontSize={{ base: "x-small", md: "sm" }} color="gray.600">
              Encapsulated wallet by Account Abstraction
            </Text>
          </Stack>
          <Stack justifyContent={"center"}>
            <Flex justify={"right"}>
              <Button borderRadius="md" bgColor={"white"} size="xs" onClick={paymasterDisclosure.onOpen}>
                <Text fontSize="xx-small" color="gray.600" textAlign={"right"}>
                  <Text as="span">Paymaster: </Text>
                  <Text as="span" fontSize="xs" mr="1">
                    0.001
                  </Text>
                  <Text as="span">ETH</Text>
                </Text>
              </Button>
            </Flex>
            <Menu>
              <MenuButton as={Button} size="xs" color="gray.600" rightIcon={<AiOutlineDown />}>
                {truncate(capsuleWalletAddress, 5, 5)}
              </MenuButton>
              <MenuList>
                <MenuItem fontSize="x-small">{capsuleWalletAddress}</MenuItem>
                <MenuDivider />
                <MenuItem fontSize={"xs"} icon={<AiOutlinePlus />}>
                  Add more
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>
        <Stack spacing="8">
          <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
            <Box w="full" px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
              <Stack>
                <Text fontWeight={"bold"} fontSize="sm" color="gray.600">
                  Capsule Walelt
                </Text>
                <Text fontSize="x-small" color="gray.600">
                  {capsuleWalletAddress}
                </Text>
                <Text color="gray.600">
                  <Text fontSize="4xl" fontWeight={"medium"} as="span" mr="2">
                    0
                  </Text>
                  <Text fontSize="sm" as="span">
                    ETH
                  </Text>
                </Text>
              </Stack>
            </Box>
            <Box w="full" px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
              <Stack>
                <Flex justify={"space-between"}>
                  <Text fontWeight={"bold"} fontSize="sm" color="gray.600">
                    WalletConnect
                  </Text>
                  <Button
                    size="xs"
                    variant={"ghost"}
                    p="0"
                    borderRadius="none"
                    onClick={qrReaderDisclosure.onOpen}
                    disabled={isWalletConnectConnecting || isWalletConnectSessionEstablished}
                  >
                    <Icon as={AiOutlineQrcode} aria-label="qrcode" color="gray.400" w={6} h={6} cursor="pointer" />
                  </Button>
                </Flex>
                <Input
                  placeholder={"WalletConnect URI"}
                  type={"text"}
                  value={walletConnectURI}
                  onChange={(e) => setWalletConnectURI(e.target.value)}
                  disabled={isWalletConnectConnecting || isWalletConnectSessionEstablished}
                />
                <Button
                  colorScheme={"blue"}
                  onClick={connectWithWalletConnect}
                  isLoading={isWalletConnectConnecting}
                  disabled={isWalletConnectSessionEstablished}
                >
                  {!isWalletConnectSessionEstablished ? "Connect" : "Connected"}
                </Button>
              </Stack>
            </Box>
          </SimpleGrid>
          <Flex justify={"center"}>
            <Tabs isFitted maxW="xl" w="full">
              <TabList mb="1em">
                <Tab>Tokens</Tab>
                <Tab>Collectables</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
                  <Stack>
                    <Text fontWeight={"medium"} color="gray.600">
                      Tokens
                    </Text>
                    <Text color="gray.600" fontSize="xs">
                      * Manage tokens
                    </Text>
                  </Stack>
                </TabPanel>
                <TabPanel px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
                  <Stack>
                    <Text fontWeight={"medium"} color="gray.600">
                      Collectables
                    </Text>
                    <Text color="gray.600" fontSize="xs">
                      * Manage collectables
                    </Text>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Stack>
      </Stack>
      <GeneralModal isOpen={paymasterDisclosure.isOpen} onClose={paymasterDisclosure.onClose} header="Manage Paymaster">
        <Stack>
          <Text color="gray.600" fontSize="xs">
            * Manage funds of paymaster
          </Text>
        </Stack>
      </GeneralModal>
      <FullModal isOpen={qrReaderDisclosure.isOpen} onClose={qrReaderDisclosure.onClose}>
        <QrReader delay={500} onError={onQRReaderError} onScan={onQRReaderScan} />
      </FullModal>
    </DefaultLayout>
  );
};

export default HomePage;
