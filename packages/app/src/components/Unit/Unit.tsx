import { Box, BoxProps, Stack, Text } from "@chakra-ui/react";

import configJsonFile from "../../../config.json";

export interface UnitProps extends BoxProps {
  header: string;
  description: string;
}

export const Unit: React.FC<UnitProps> = ({ children, header, description, ...props }) => {
  return (
    <Box
      mx="auto"
      w="full"
      p="4"
      boxShadow={configJsonFile.style.shadow}
      borderRadius={configJsonFile.style.radius}
      bgColor={configJsonFile.style.color.white.bg}
      {...props}
    >
      <Stack spacing="2">
        <Stack spacing="1">
          <Text fontWeight={"bold"} fontSize="md" color={configJsonFile.style.color.black.text.primary}>
            {header}
          </Text>
          <Text fontSize="sm" color={configJsonFile.style.color.black.text.secondary}>
            {description}
          </Text>
        </Stack>
        <Box py="2">{children}</Box>
      </Stack>
    </Box>
  );
};
