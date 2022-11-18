/* eslint-disable camelcase */
import { EntryPoint__factory } from "@account-abstraction/contracts";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNetwork, useSigner } from "wagmi";

import deployments from "../../../contracts/deployments.json";
import { ChainlinkStripePaymaster } from "../../../contracts/lib/ChainlinkStripePaymaster";
import { LinkWalletAPI } from "../../../contracts/lib/LinkWalletAPI";
import { useIsSignedIn } from "./useIsSignedIn";

export const useLinkWalletAPI = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const { isSignedIn } = useIsSignedIn();

  const [bundler, setBundler] = useState<HttpRpcClient>();
  const [linkWalletAPI, setLinkWalletAPI] = useState<LinkWalletAPI>();
  const [linkWalletAddress, setLinkWalletAddress] = useState<string>();
  const [linkWalletBalance, setLinkWalletBalance] = useState("0");

  useEffect(() => {
    (async () => {
      if (!chain || !signer || !signer.provider || !isSignedIn) {
        setLinkWalletAPI(undefined);
        setLinkWalletAddress("");
        return;
      }
      const uri = chain.id === 1337 ? "http://localhost:3001/rpc" : "http://localhost:3002/rpc";
      const bundler = new HttpRpcClient(uri, deployments.entryPoint, chain.id);
      setBundler(bundler);
      const provider = signer.provider;

      const chainlinkStripePaymaster = new ChainlinkStripePaymaster(deployments.paymaster);

      console.log("deployments.entryPoint", deployments.entryPoint);

      const linkWalletAPI = new LinkWalletAPI({
        provider,
        entryPointAddress: deployments.entryPoint,
        owner: signer,
        factoryAddress: deployments.factory,
        index: 0,
        paymasterAPI: chainlinkStripePaymaster,
      });
      setLinkWalletAPI(linkWalletAPI);
      const LinkWalletAddress = await linkWalletAPI.getWalletAddress();
      setLinkWalletAddress(LinkWalletAddress);
      const LinkWalletBalanceBigNumber = await provider.getBalance(LinkWalletAddress);
      const remainder = LinkWalletBalanceBigNumber.mod(1e14);
      const LinkWalletBalance = ethers.utils.formatEther(LinkWalletBalanceBigNumber.sub(remainder));
      setLinkWalletBalance(LinkWalletBalance);
    })();
  }, [chain, signer, isSignedIn]);

  const getTransactionHashByRequestID = async (requestId: string) => {
    if (!signer || !signer.provider) {
      throw new Error("signer or provider invalid");
    }
    const provider = signer.provider;
    const entryPoint = EntryPoint__factory.connect(deployments.entryPoint, signer.provider);
    const filter = entryPoint.filters.UserOperationEvent(requestId);
    const transactionHash: string = await new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        console.log("fetching request status...");
        const logs = await provider.getLogs(filter);
        if (logs.length > 0) {
          clearInterval(intervalId);
          const [{ transactionHash }] = logs;
          resolve(transactionHash);
        }
      }, 1000);
    });

    return transactionHash;
  };

  return {
    bundler,
    linkWalletAPI,
    linkWalletAddress,
    linkWalletBalance,
    getTransactionHashByRequestID,
  };
};
