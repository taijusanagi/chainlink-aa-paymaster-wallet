import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { NextPage } from "next";

import { DefaultLayout } from "@/components/layouts/Default";

const HomePage: NextPage = () => {
  return (
    <DefaultLayout>
      <Stack spacing="4">
        <Stack>
          <Heading fontWeight={"bold"} size="sm" color="gray.600">
            AA Capsule
          </Heading>
          <Text fontSize="xs" color="blue.500">
            * Please connect Goerli network
          </Text>
        </Stack>
        <Stack spacing="8">
          <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
            <Box w="full" px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
              <Stack>
                <Text fontWeight={"bold"} color="gray.600">
                  Paymaster
                </Text>
                <Text fontWeight={"bold"} color="gray.600">
                  Capsule Walelt
                </Text>
              </Stack>
            </Box>
            <Box w="full" px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
              <Stack>
                <Input />
                <Button colorScheme={"blue"}>Scan</Button>
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
                    <Text fontWeight={"bold"} color="gray.600">
                      Tokens
                    </Text>
                  </Stack>
                </TabPanel>
                <TabPanel px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
                  <Stack>
                    <Text fontWeight={"bold"} color="gray.600">
                      Collectables
                    </Text>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Stack>
      </Stack>
    </DefaultLayout>
  );
};

export default HomePage;
