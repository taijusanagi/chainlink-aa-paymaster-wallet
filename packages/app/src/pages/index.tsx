import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { signTypedData } from "@wagmi/core";
import WalletConnect from "@walletconnect/client";
import { convertHexToUtf8 } from "@walletconnect/utils";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlinePlus, AiOutlineQrcode } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { NFT } from "types/nft";
import { useNetwork, useSigner } from "wagmi";

import { FullModal, GeneralModal } from "@/components/elements/Modal";
import { DefaultLayout } from "@/components/layouts/Default";
import { useCapsuleWalletAPI } from "@/hooks/useCapsuleWalletApi";
import { useIsWagmiConnected } from "@/hooks/useIsWagmiConnected";
import { analysis } from "@/lib/analysis";
import { getDroppedNFTsByOwner, getNFTDropMintFunctionData } from "@/lib/contracts";
import { truncate } from "@/lib/utils";

import deployments from "../../../contracts/deployments.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrReader = require("react-qr-scanner");

const HomePage: NextPage = () => {
  /*
   * Hooks
   */
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { openConnectModal } = useConnectModal();
  const { isWagmiConnected } = useIsWagmiConnected();
  const { capsuleWalletAddress, capsuleWalletBalance, bundler, capsuleWalletAPI, getTransactionHashByRequestID } =
    useCapsuleWalletAPI();
  const qrReaderDisclosure = useDisclosure();
  const txAnalysisDisclosure = useDisclosure();
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const [txIndex, setTxIndex] = useState(0);
  const [isWalletConnectConnecting, setIsWalletConnectConnecting] = useState(false);
  const [isWalletConnectSessionEstablished, setIsWalletConnectSessionEstablished] = useState(false);
  const [walletConnectURI, setWalletConnectURI] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [expected, setExpected] = useState<{ general: string[]; operation: string[]; simulation: string[] }>({
    general: [],
    operation: [],
    simulation: [],
  });

  /*
   * Functions
   */
  const onQRReaderScan = (result: { text: string }) => {
    if (!result) {
      return;
    }
    const walletConnectURI = result.text;
    setWalletConnectURI(walletConnectURI);
    connectWithWalletConnect(walletConnectURI);
    qrReaderDisclosure.onClose();
  };

  const onQRReaderError = (err: unknown) => {
    console.error(err);
  };

  const incrementDescriptionIndex = () => {
    setDescriptionIndex((prevIndex) => prevIndex + 1);
  };

  const connectWithWalletConnect = async (walletConnectURI: string) => {
    if (!chain || !signer || !bundler || !capsuleWalletAPI || !capsuleWalletAddress) {
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
        walletConnectConnector.approveSession({ chainId: chain.id, accounts: [capsuleWalletAddress] });
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
            capsuleWalletAddress,
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

  const deposit = async () => {
    if (!signer || !capsuleWalletAddress) {
      return;
    }
    signer.sendTransaction({ to: capsuleWalletAddress, value: ethers.utils.parseEther("0.2") });
  };

  const mintNFT = async () => {
    if (!bundler || !capsuleWalletAPI || !capsuleWalletAddress) {
      return;
    }
    const data = getNFTDropMintFunctionData();
    const target = deployments.nftDrop;
    const value = "0";
    await processTx(capsuleWalletAddress, target, data, value);
  };

  const processTx = async (from: string, to: string, data: string, value: string, gasLimit?: string) => {
    if (!capsuleWalletAPI || !bundler) {
      return;
    }
    setTxIndex(0);
    txAnalysisDisclosure.onOpen();
    const result = await analysis(from, to, data, value);
    setExpected(result);
    setTxIndex(1);
    const op = await capsuleWalletAPI.createSignedUserOp({
      target: deployments.nftDrop,
      data,
      value,
      gasLimit,
    });
    console.log("user op", op);
    const requestId = await bundler.sendUserOpToBundler(op);
    setTxIndex(2);
    console.log("request sent", requestId);
    const transactionHash = await getTransactionHashByRequestID(requestId);
    console.log("transactionHash", transactionHash);
    setTransactionHash(transactionHash);
    setTxIndex(3);
  };

  const clearTxModal = () => {
    setTxIndex(0);
    txAnalysisDisclosure.onClose();
  };

  useEffect(() => {
    if (!signer || !signer.provider || !capsuleWalletAddress) {
      return;
    }
    getDroppedNFTsByOwner(signer.provider, capsuleWalletAddress).then((nfts) => {
      setNFTs(nfts);
    });
  }, [signer, capsuleWalletAddress]);

  return (
    <DefaultLayout>
      {!isWagmiConnected && (
        <Box maxW="lg" mx="auto" px="8" py="12" boxShadow={"md"} borderRadius="xl" bgColor={"white"}>
          <Stack spacing="4">
            <Heading fontWeight={"bold"} size={"xs"} color="gray.600" textAlign={"center"}>
              Capsule Wallet
            </Heading>
            {descriptionIndex === 0 && (
              <Stack>
                <Text align={"center"} fontSize="xs" fontWeight={"medium"} color="gray.600">
                  Encapsulated wallet by Account Abstraction
                </Text>
                <Center py="8">
                  <Image h="240" src="./img/security.svg" alt="security" objectFit={"contain"} />
                </Center>
              </Stack>
            )}
            {descriptionIndex === 1 && (
              <Stack>
                <Text align={"center"} fontSize="xs" fontWeight={"medium"} color="gray.600">
                  Capsule Wallet is Encapsulated security layer of your wallet
                </Text>
                <Center py="8">
                  <Image h="240" src="./img/concept.png" alt="security" objectFit={"contain"} />
                </Center>
              </Stack>
            )}
            {descriptionIndex === 2 && (
              <Stack>
                <Text align={"center"} fontSize="xs" fontWeight={"medium"} objectFit={"contain"} color="gray.600">
                  Burner wallets for better security but it is hard to manage
                </Text>
                <Center py="8">
                  <Image h="240" src="./img/burner-wallet.png" alt="security" objectFit={"contain"} />
                </Center>
              </Stack>
            )}
            {descriptionIndex === 3 && (
              <Stack>
                <Text align={"center"} fontSize="xs" fontWeight={"medium"} color="gray.600">
                  Capsule wallet provides security with better UX
                </Text>
                <Center py="8">
                  <Image h="240" src="./img/account-abstraction.png" alt="security" objectFit={"contain"} />
                </Center>
              </Stack>
            )}
            {descriptionIndex === 4 && (
              <Stack>
                <Text align={"center"} fontSize="xs" fontWeight={"medium"} color="gray.600">
                  Let&apos;s use Capsule Wallet for your crypto journey!
                </Text>
                <Center py="8">
                  <Image h="240" src="./img/unlock.svg" alt="unlock"></Image>
                </Center>
              </Stack>
            )}
            <Stack>
              <Button onClick={openConnectModal} colorScheme={"blue"} fontWeight="bold">
                Connect Wallet
              </Button>
              <HStack>
                <Button
                  w="full"
                  onClick={incrementDescriptionIndex}
                  fontWeight="bold"
                  color="gray.600"
                  disabled={descriptionIndex === 4}
                >
                  {descriptionIndex === 0 ? "What is it?" : "Next"}
                </Button>
              </HStack>
            </Stack>
          </Stack>
        </Box>
      )}
      {isWagmiConnected && (
        <Box>
          <Stack spacing="4">
            <Flex justify={"space-between"}>
              <Stack>
                <Heading fontWeight={"bold"} size={"xs"} color="gray.600">
                  Capsule Wallet
                </Heading>
                <Text fontSize={"x-small"} color="gray.600">
                  Encapsulated wallet by Account Abstraction
                </Text>
              </Stack>
              <Stack justifyContent={"center"}>
                <Menu>
                  <MenuButton as={Button} size="xs" color="gray.600" rightIcon={<AiOutlineDown />}>
                    {truncate(capsuleWalletAddress, 5, 5)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem fontSize="x-small">{capsuleWalletAddress}</MenuItem>
                    <MenuDivider />
                    <Button size={"xs"} leftIcon={<AiOutlinePlus />} variant={"ghost"} w="full" disabled>
                      Add (not implemented)
                    </Button>
                  </MenuList>
                </Menu>
              </Stack>
            </Flex>
            <Stack spacing="4">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box w="full" px="6" py="4" boxShadow={"md"} borderRadius="xl" bgColor={"white"}>
                  <Stack spacing="2">
                    <Flex justify={"space-between"}>
                      <Text fontWeight={"bold"} fontSize="sm" color="gray.600">
                        Account
                      </Text>
                      <Button color={"blue.500"} variant="ghost" size="xs" onClick={deposit}>
                        Deposit
                      </Button>
                    </Flex>
                    <Stack spacing="1">
                      <Text fontWeight={"medium"} fontSize="xs" color="gray.600">
                        Address
                      </Text>
                      <Text fontSize="x-small" color="gray.600">
                        {capsuleWalletAddress}
                      </Text>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontWeight={"medium"} fontSize="xs" color="gray.600">
                        Balance:
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        <Text fontWeight={"bold"} as="span" mr="1">
                          {capsuleWalletBalance}
                        </Text>
                        <Text as="span">ETH</Text>
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
                <Box w="full" px="6" py="4" boxShadow={"md"} borderRadius="xl" bgColor={"white"}>
                  <Stack>
                    <Flex justify={"space-between"}>
                      <HStack justifyContent={"center"}>
                        <Text fontSize="sm" as="span" fontWeight={"bold"} color="gray.600">
                          WalletConnect
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          as={"a"}
                          href="https://example.walletconnect.org/"
                          target="_blank"
                        >
                          <Icon as={FiExternalLink} aria-label="external-link" color="blue.500" w={4} h={4} />
                        </Button>
                      </HStack>
                      <Button
                        size="xs"
                        variant={"ghost"}
                        p="0"
                        borderRadius="none"
                        onClick={qrReaderDisclosure.onOpen}
                        disabled={isWalletConnectConnecting || isWalletConnectSessionEstablished}
                      >
                        <Icon as={AiOutlineQrcode} aria-label="qrcode" color="blue.500" w={6} h={6} cursor="pointer" />
                      </Button>
                    </Flex>
                    <Input
                      placeholder={"Paste wc: uri"}
                      type={"text"}
                      value={walletConnectURI}
                      fontSize="xs"
                      onChange={(e) => setWalletConnectURI(e.target.value)}
                      disabled={isWalletConnectConnecting || isWalletConnectSessionEstablished}
                    />
                    <Button
                      colorScheme={"blue"}
                      fontWeight="bold"
                      onClick={() => connectWithWalletConnect(walletConnectURI)}
                      isLoading={isWalletConnectConnecting}
                      disabled={isWalletConnectSessionEstablished}
                    >
                      {!isWalletConnectSessionEstablished ? "Connect" : "Connected"}
                    </Button>
                  </Stack>
                </Box>
              </SimpleGrid>
              <Flex justify={"center"}>
                <Tabs isFitted maxW="xl" w="full" defaultIndex={1}>
                  <TabList mb="1em">
                    <Tab isDisabled>Tokens</Tab>
                    <Tab>Collectables</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel />
                    <TabPanel px="6" py="4" boxShadow={"md"} borderRadius="xl" bgColor={"white"}>
                      <Flex justify={"space-between"}>
                        <Text as="span" fontWeight={"bold"} fontSize="sm" color="gray.600">
                          Collectables
                        </Text>
                        <HStack>
                          <Button color={"blue.500"} variant="ghost" size="xs" onClick={mintNFT}>
                            Mint
                          </Button>
                        </HStack>
                      </Flex>
                      {nfts.length === 0 && (
                        <Text py="2" fontSize="xs" color="gray.600">
                          * Please mint NFTs to Capsule Wallet for the demo
                        </Text>
                      )}
                      {nfts.length > 0 && (
                        <SimpleGrid py="8" px="4" columns={{ base: 2, md: 4 }} spacing={6}>
                          {nfts.map((nft) => (
                            <Box key={nft.tokenId}>
                              <Image src={nft.image} alt="image" />
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Flex>
            </Stack>
          </Stack>
          <FullModal isOpen={qrReaderDisclosure.isOpen} onClose={qrReaderDisclosure.onClose}>
            <QrReader delay={500} onError={onQRReaderError} onScan={onQRReaderScan} />
          </FullModal>
          <GeneralModal isOpen={txAnalysisDisclosure.isOpen} onClose={clearTxModal} header="Tx Analysis">
            {txIndex === 0 && (
              <Center h="200">
                <Spinner />
              </Center>
            )}
            {txIndex === 1 && (
              <Stack spacing="4">
                <Text fontSize="sm" fontWeight={"bold"} color="gray.600">
                  Tx General Info
                </Text>
                <Stack>
                  {expected.general.map((_txt, i) => {
                    return (
                      <Text key={`analysis_general_${i}`} fontSize="xs">
                        {_txt}
                      </Text>
                    );
                  })}
                </Stack>
                <Stack>
                  <Text fontSize="sm" fontWeight={"bold"} color="gray.600">
                    Detail
                  </Text>
                  {expected.operation.map((_txt, i) => {
                    return (
                      <Text key={`analysis_operation_${i}`} fontSize="xs" fontWeight={"bold"}>
                        {_txt}
                      </Text>
                    );
                  })}
                </Stack>
                <Box px="6" py="4" boxShadow={"md"} borderRadius="xl" bgColor={"white"}>
                  {expected.simulation.map((_txt, i) => {
                    return (
                      <Text key={`analysis_simulation_${i}`} fontSize="x-small" color="gray.600">
                        {_txt}
                      </Text>
                    );
                  })}
                </Box>
              </Stack>
            )}
            {txIndex === 2 && (
              <Center h="200">
                <Spinner />
              </Center>
            )}
            {txIndex === 3 && (
              <Stack>
                <Heading fontWeight={"bold"} size={"xs"} color="gray.600" textAlign={"center"}>
                  Congratulation
                </Heading>
                <Stack>
                  <Text align={"center"} fontSize="xs" fontWeight={"medium"} color="gray.600">
                    You sent a secure tx with Capsule Wallet
                  </Text>
                  <Text align={"center"} fontSize="xs">
                    <Link href={`https://goerli.etherscan.io/tx/${transactionHash}`} color="blue.500" target={"_blank"}>
                      Exproler
                    </Link>
                  </Text>
                  <Center py="8">
                    <Image h="200" src="./img/security.svg" alt="security" objectFit={"contain"} />
                  </Center>
                </Stack>
              </Stack>
            )}
          </GeneralModal>
        </Box>
      )}
    </DefaultLayout>
  );
};

export default HomePage;
