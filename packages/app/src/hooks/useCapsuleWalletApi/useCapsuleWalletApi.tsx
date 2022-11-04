/* eslint-disable camelcase */
import { EntryPoint__factory } from "@account-abstraction/contracts";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNetwork, useSigner } from "wagmi";

import deployments from "../../../../contracts/deployments.json";
import { CapsuleWalletAPI } from "../../../../contracts/lib/CapsuleWalletAPI";

export const useCapsuleWalletAPI = (index = 0) => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const [bundler, setBundler] = useState<HttpRpcClient>();
  const [capsuleWalletAPI, setCapsuleWalletAPI] = useState<CapsuleWalletAPI>();
  const [capsuleWalletAddress, setCapsuleWalletAddress] = useState<string>();
  const [capsuleWalletBalance, setCapsuleWalletBalance] = useState("0");

  useEffect(() => {
    (async () => {
      if (!chain || !signer || !signer.provider) {
        setCapsuleWalletAPI(undefined);
        setCapsuleWalletAddress("");
        return;
      }
      const uri = chain.id === 1337 ? "http://localhost:3001/rpc" : "http://localhost:3002/rpc";
      const bundler = new HttpRpcClient(uri, deployments.entryPoint, chain.id);
      setBundler(bundler);
      const provider = signer.provider;
      const capsuleWalletAPI = new CapsuleWalletAPI({
        provider,
        entryPointAddress: deployments.entryPoint,
        owner: signer,
        factoryAddress: deployments.factory,
        index,
      });
      setCapsuleWalletAPI(capsuleWalletAPI);
      const capsuleWalletAddress = await capsuleWalletAPI.getWalletAddress();
      setCapsuleWalletAddress(capsuleWalletAddress);
      const capsuleWalletBalanceBigNumber = await provider.getBalance(capsuleWalletAddress);
      const remainder = capsuleWalletBalanceBigNumber.mod(1e14);
      const capsuleWalletBalance = ethers.utils.formatEther(capsuleWalletBalanceBigNumber.sub(remainder));
      setCapsuleWalletBalance(capsuleWalletBalance);
    })();
  }, [chain, signer, index]);

  const getTransactionHashByRequestID = async (requestId: string) => {
    if (!signer || !signer.provider) {
      throw new Error("signer or provider invalid");
    }
    const provider = signer.provider;
    const entryPoint = EntryPoint__factory.connect(deployments.entryPoint, signer.provider);
    const filter = entryPoint.filters.UserOperationEvent(requestId);
    const transactionHash = await new Promise((resolve) => {
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
    capsuleWalletAPI,
    capsuleWalletAddress,
    capsuleWalletBalance,
    getTransactionHashByRequestID,
  };
};
