/* eslint-disable camelcase */
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useSigner } from "wagmi";

import { CHAIN_ID } from "@/config";

import rpc from "../../../../contracts/config/rpc.json";
import deployments from "../../../../contracts/deployments.json";
import { CapsuleWalletAPI } from "../../../../contracts/lib/CapsuleWalletAPI";
import { UserOperationStruct } from "../../../../contracts/typechain-types/contracts/CapsuleWallet";

export const useCapsuleWalletAPI = (index = 0) => {
  const { data: signer } = useSigner();

  const [capsuleWalletAPI, setCapsuleWalletAPI] = useState<CapsuleWalletAPI>();
  const [capsuleWalletAddress, setCapsuleWalletAddress] = useState("");
  const [capsuleWalletBalance, setCapsuleWalletBalance] = useState("0");

  const bundler = useMemo(() => {
    return new HttpRpcClient("http://localhost:3001/rpc", deployments.entryPoint, CHAIN_ID);
  }, []);

  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(rpc.goerli);
  }, []);

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
    return await bundler.sendUserOpToBundler(op);
  };

  useEffect(() => {
    (async () => {
      if (!signer) {
        setCapsuleWalletAPI(undefined);
        setCapsuleWalletAddress("");
        return;
      }
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
  }, [provider, signer, index]);

  return {
    capsuleWalletAPI,
    capsuleWalletAddress,
    capsuleWalletBalance,
    signMessage,

    createSignedUserOp,
    sendUserOpToBundler,
  };
};
