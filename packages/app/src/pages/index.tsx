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
import { useCapsuleWalletAPI } from "@/hooks/useCapsuleWalletApi";
import { truncate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrReader = require("react-qr-scanner");

const HomePage: NextPage = () => {
  /*
   * Hooks
   */

  const [capsuleWalletIndex, setCapsuleWalletIndex] = useState(0);
  const { capsuleWalletAddress } = useCapsuleWalletAPI(capsuleWalletIndex);
  const paymasterDisclosure = useDisclosure();
  const qrReaderDisclosure = useDisclosure();
  const [walletConnectURI, setWalletConnectURI] = useState("");

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

  const connectByWalletConnect = async () => {
    const connector = new WalletConnect({
      uri: walletConnectURI,
    });
    await connector.createSession();
    connector.on("session_request", (error, payload) => {
      console.log("session_request", payload);
      if (error) {
        throw error;
      }
      // connector.approveSession({ chainId: network.chain.id, accounts: [contractWalletAddress] });
    });
    connector.on("call_request", async (error, payload) => {
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
    connector.on("disconnect", (error, payload) => {
      console.log("disconnect", payload);
      if (error) {
        throw error;
      }
    });
  };

  return (
    <DefaultLayout>
      <Stack spacing="4">
        <Flex justify={"space-between"}>
          <Stack>
            <Heading fontWeight={"bold"} size="sm" color="gray.600">
              AA Capsule
            </Heading>
            <Text fontSize="xs" color="blue.500">
              * Please connect Goerli network
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
                <Text fontWeight={"medium"} color="gray.600">
                  Capsule Walelt
                </Text>
                <Text fontSize="x-small" color="gray.600">
                  0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8
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
                  <Text fontWeight={"medium"} color="gray.600">
                    Wallet Connect
                  </Text>
                  <Button size="xs" variant={"ghost"} p="0" borderRadius="none" onClick={qrReaderDisclosure.onOpen}>
                    <Icon as={AiOutlineQrcode} aria-label="qrcode" color="gray.400" w={6} h={6} cursor="pointer" />
                  </Button>
                </Flex>
                <Input type={"text"} value={walletConnectURI} onChange={(e) => setWalletConnectURI(e.target.value)} />
                <Button colorScheme={"blue"} onClick={connectByWalletConnect}>
                  Connect
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
