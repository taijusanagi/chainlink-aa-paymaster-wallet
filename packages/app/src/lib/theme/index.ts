import { theme } from "@chakra-ui/pro-theme";
import { extendTheme } from "@chakra-ui/react";
import { lightTheme } from "@rainbow-me/rainbowkit";

export const myChakraUITheme = extendTheme(
  {
    colors: { ...theme.colors, brand: theme.colors.teal },
  },
  theme
);

const rainbowKitTheme = lightTheme();
export const myRainbowKitTheme = {
  ...rainbowKitTheme,
  colors: {
    ...rainbowKitTheme.colors,
    accentColor: theme.colors.teal[500],
  },
  fonts: {
    ...rainbowKitTheme.fonts,
    body: theme.fonts.body,
  },
  shadows: {
    ...rainbowKitTheme.shadows,
    connectButton: theme.shadows.md,
  },
};
