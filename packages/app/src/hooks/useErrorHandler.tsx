import { useToast } from "@chakra-ui/react";

import { truncate } from "@/lib/utils";

export const useErrorHandler = () => {
  const toast = useToast();
  const handleError = (e: unknown) => {
    let description = "";
    if (e instanceof Error) {
      description = e.message;
    } else if (typeof e === "string") {
      description = e;
    } else {
      description = "Unexpected error";
    }
    console.error(description);
    toast({
      title: `Error`,
      description: truncate(description, 100),
      status: "info",
      position: "top-right",
      duration: 10000,
      isClosable: true,
    });
  };
  return { handleError };
};
