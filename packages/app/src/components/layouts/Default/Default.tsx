import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

import { APP_NAME } from "@/config";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <Flex minHeight={"100vh"} direction={"column"}>
      <Container as="section" maxW="8xl" mb="8">
        <Box as="nav" py="4">
          <Flex justify="space-between" alignItems={"center"} h="8">
            <Text fontSize="lg" fontWeight={"bold"}>
              {APP_NAME}
            </Text>
            <HStack>
              <ConnectButton accountStatus={"full"} showBalance={false} chainStatus={"name"} />
            </HStack>
          </Flex>
        </Box>
      </Container>
      <Container maxW="2xl" py="12">
        <Box py="8" px="8" boxShadow={"base"} borderRadius="2xl" bgColor={"white"}>
          {children}
        </Box>
      </Container>
    </Flex>
  );
};
