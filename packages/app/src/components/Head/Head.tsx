import NextHead from "next/head";

import configJsonFile from "../../../config.json";

export const Head = () => {
  return (
    <NextHead>
      <title>{configJsonFile.name}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <meta property="og:url" content={configJsonFile.url.app} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={configJsonFile.name} />
      <meta property="og:site_name" content={configJsonFile.name} />
      <meta property="og:description" content={configJsonFile.description} />
      <meta property="og:image" content={`${configJsonFile.url.app}/assets/share.png`} />
      <meta name="twitter:card" content="summary_large_image" />
    </NextHead>
  );
};
