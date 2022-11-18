import { Box, BoxProps, Stack, Text } from "@chakra-ui/react";

import configJsonFile from "../../../config.json";

export interface UnitProps extends BoxProps {
  header: string;
}

export const Unit: React.FC<UnitProps> = ({ children, header, ...props }) => {
  return (
    <Box
      mx="auto"
      w="full"
      px="4"
      py="4"
      boxShadow={configJsonFile.style.shadow}
      borderRadius={configJsonFile.style.radius}
      bgColor={configJsonFile.style.color.white.bg}
      {...props}
    >
      <Stack>
        <Text fontWeight={"bold"} fontSize="md" color={configJsonFile.style.color.black.text.primary}>
          {header}
        </Text>
        <Box py="2">{children}</Box>
      </Stack>
    </Box>
  );
};
