import {
  Box,
  Button,
  Flex,
  Heading,
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
} from "@chakra-ui/react";
import { NextPage } from "next";
import { AiOutlineDown, AiOutlinePlus } from "react-icons/ai";

import { DefaultLayout } from "@/components/layouts/Default";
import { truncate } from "@/lib/utils";

const HomePage: NextPage = () => {
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
          <Stack>
            <Flex justify={"right"}>
              <Button boxShadow={"base"} borderRadius="md" bgColor={"white"} size="xs">
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
                {truncate("0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8", 5, 5)}
              </MenuButton>
              <MenuList>
                <MenuItem fontSize="x-small">0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8</MenuItem>
                <MenuItem fontSize="x-small">0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8</MenuItem>
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
                <Text fontWeight={"medium"} color="gray.600">
                  Wallet Connect
                </Text>
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
                    <Text fontWeight={"medium"} color="gray.600">
                      Tokens
                    </Text>
                    <Text color="gray.600" fontSize="xs">
                      * This can be integrated with some data provider API
                    </Text>
                  </Stack>
                </TabPanel>
                <TabPanel px="6" py="4" boxShadow={"base"} borderRadius="xl" bgColor={"white"}>
                  <Stack>
                    <Text fontWeight={"medium"} color="gray.600">
                      Collectables
                    </Text>
                    <Text color="gray.600" fontSize="xs">
                      * This can be integrated with some data provider API
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
