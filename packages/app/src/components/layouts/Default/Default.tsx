import { Box, Button, Container, Flex, HStack, Icon, Image, Link, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import React from "react";
import { FaGithub } from "react-icons/fa";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <Flex minHeight={"100vh"} direction={"column"}>
      <Container as="section" maxW="8xl">
        <Box as="nav" py="4">
          <Flex justify="space-between" alignItems={"center"} h="8">
            <Button variant="ghost" onClick={() => router.reload()}>
              <Image src="/img/logo.png" alt="logo" h="8" />
            </Button>
            <HStack>
              <ConnectButton accountStatus={"full"} showBalance={false} chainStatus={"name"} />
            </HStack>
          </Flex>
        </Box>
      </Container>
      <Container maxW="6xl" py="8" flex={1}>
        {children}
      </Container>
      <Container maxW="8xl">
        <HStack justify={"space-between"}>
          <Text fontSize={"xs"} color="gray.400" fontWeight={"medium"} py="4">
            <Link href="https://tokyo.akindo.io/" target={"_blank"}>
              😘 Tokyo Web3 Hackathon
            </Link>
          </Text>
          <Link href="https://github.com/taijusanagi/aa-capsule" target={"_blank"}>
            <Icon as={FaGithub} aria-label="github" color="gray.400" />
          </Link>
        </HStack>
      </Container>
    </Flex>
  );
};
