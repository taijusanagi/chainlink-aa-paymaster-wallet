import { theme } from "@chakra-ui/pro-theme";
import { extendTheme } from "@chakra-ui/react";
import { lightTheme } from "@rainbow-me/rainbowkit";

import configJsonFile from "../../../config.json";

export const myChakraUITheme = extendTheme(
  {
    colors: { ...theme.colors, brand: configJsonFile.style.color.brand },
    components: {
      Button: {
        baseStyle: {
          rounded: configJsonFile.style.radius,
          shadow: configJsonFile.style.shadow,
        },
        defaultProps: {
          size: configJsonFile.style.size,
          variant: "primary",
          colorScheme: "brand",
        },
      },
      Select: {
        defaultProps: {
          size: configJsonFile.style.size,
        },
      },
    },
  },
  theme
);

const rainbowKitTheme = lightTheme();
export const myRainbowKitTheme = {
  ...rainbowKitTheme,
  colors: {
    ...rainbowKitTheme.colors,
    accentColor: myChakraUITheme.colors.brand[500],
  },
};
