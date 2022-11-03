/* eslint-disable camelcase */
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useSigner } from "wagmi";

import rpc from "../../../../contracts/config/rpc.json";
import deployments from "../../../../contracts/deployments.json";
import { CapsuleWalletAPI } from "../../../../contracts/lib/CapsuleWalletAPI";

export const useCapsuleWalletAPI = (index: number) => {
  const { data: signer } = useSigner();

  const [capsuleWalletAPI, setCapsuleWalletAPI] = useState<CapsuleWalletAPI>();

  const [signerAddress, setSignerAddress] = useState("");
  const [capsuleWalletAddress, setCapsuleWalletAddress] = useState("");
  const [capsuleWalletBalance, setCapsuleWalletBalance] = useState("0");

  const bundler = useMemo(() => {
    return new HttpRpcClient("http://localhost:3001/rpc", deployments.entryPoint, 5);
  }, []);

  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(rpc.goerli);
  }, []);

  const signAndSendTxWithBundler = async (target: string, data: string, value: string) => {
    if (!capsuleWalletAPI) {
      return;
    }
    const op = await capsuleWalletAPI.createSignedUserOp({
      target,
      data,
      value,
    });
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
      signer.getAddress().then((signerAddress) => setSignerAddress(signerAddress));

      const capsuleWalletAddress = await capsuleWalletAPI.getWalletAddress();
      setCapsuleWalletAddress(capsuleWalletAddress);
      provider.getBalance(capsuleWalletAddress).then((capsuleWalletBalanceBigNumber) => {
        const capsuleWalletBalance = ethers.utils.formatEther(capsuleWalletBalanceBigNumber);
        setCapsuleWalletBalance(capsuleWalletBalance);
      });
    })();
  }, [provider, signer, index]);

  return {
    signerAddress,
    capsuleWalletAPI,
    capsuleWalletAddress,
    capsuleWalletBalance,
    signAndSendTxWithBundler,
  };
};
