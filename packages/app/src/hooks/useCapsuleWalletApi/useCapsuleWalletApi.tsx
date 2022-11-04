/* eslint-disable camelcase */
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useNetwork, useSigner } from "wagmi";

import deployments from "../../../../contracts/deployments.json";
import { CapsuleWalletAPI } from "../../../../contracts/lib/CapsuleWalletAPI";
import { UserOperationStruct } from "../../../../contracts/typechain-types/contracts/CapsuleWallet";

export const useCapsuleWalletAPI = (index = 0) => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const [capsuleWalletAPI, setCapsuleWalletAPI] = useState<CapsuleWalletAPI>();
  const [capsuleWalletAddress, setCapsuleWalletAddress] = useState("");
  const [capsuleWalletBalance, setCapsuleWalletBalance] = useState("0");

  const bundler = useMemo(() => {
    if (!chain) {
      return;
    }
    const uri = chain.id === 1337 ? "http://localhost:3001/rpc" : "http://localhost:3002/rpc";
    return new HttpRpcClient(uri, deployments.entryPoint, chain.id);
  }, [chain]);

  const signMessage = async (message: string) => {
    if (!signer) {
      throw Error("signer not defined");
    }
    return await signer.signMessage(message);
  };

  const createSignedUserOp = async (target: string, data: string, value: string, gasLimit: string) => {
    if (!capsuleWalletAPI) {
      throw Error("capsuleWalletAPI not defined");
    }
    return await capsuleWalletAPI.createSignedUserOp({
      target,
      data,
      value,
      gasLimit,
    });
  };

  const sendUserOpToBundler = async (op: UserOperationStruct) => {
    if (!bundler) {
      throw Error("bundler not defined");
    }
    return await bundler.sendUserOpToBundler(op);
  };

  useEffect(() => {
    (async () => {
      if (!chain || !signer || !signer.provider) {
        setCapsuleWalletAPI(undefined);
        setCapsuleWalletAddress("");
        return;
      }
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

  return {
    capsuleWalletAPI,
    capsuleWalletAddress,
    capsuleWalletBalance,
    signMessage,
    createSignedUserOp,
    sendUserOpToBundler,
  };
};
