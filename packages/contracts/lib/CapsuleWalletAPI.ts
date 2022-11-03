/* eslint-disable camelcase */

/**
 ** This is extended from
 ** https://github.com/eth-infinitism/bundler/blob/main/packages/sdk/src/SimpleWalletAPI.ts
 **/

import { SimpleWalletAPI } from "@account-abstraction/sdk";
import { hexConcat } from "ethers/lib/utils";

import {
  CapsuleWallet,
  CapsuleWallet__factory,
  CapsuleWalletDeployer,
  CapsuleWalletDeployer__factory,
} from "../typechain-types";

export class CapsuleWalletAPI extends SimpleWalletAPI {
  walletContract?: CapsuleWallet;
  factory?: CapsuleWalletDeployer;

  async _getWalletContract(): Promise<CapsuleWallet> {
    if (this.walletContract == null) {
      this.walletContract = CapsuleWallet__factory.connect(await this.getWalletAddress(), this.provider);
    }
    return this.walletContract;
  }

  async getCounterFactualAddress(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== "") {
        this.factory = CapsuleWalletDeployer__factory.connect(this.factoryAddress, this.provider);
      } else {
        throw new Error("no factory to get initCode");
      }
    }
    // TODO: use client calculation for better UX
    return this.factory.getCreate2Address(this.entryPointAddress, await this.owner.getAddress(), this.index);
  }

  async getWalletInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== "") {
        this.factory = CapsuleWalletDeployer__factory.connect(this.factoryAddress, this.provider);
      } else {
        throw new Error("no factory to get initCode");
      }
    }
    const ownerAddress = await this.owner.getAddress();
    const data = this.factory.interface.encodeFunctionData("deployWallet", [
      this.entryPointAddress,
      ownerAddress,
      this.index,
    ]);
    return hexConcat([this.factory.address, data]);
  }
}
