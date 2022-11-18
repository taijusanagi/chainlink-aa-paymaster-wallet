/* eslint-disable camelcase */
import { EntryPoint__factory, UserOperationStruct } from "@account-abstraction/contracts";
import { rethrowError } from "@account-abstraction/utils";
import { SampleRecipient__factory } from "@account-abstraction/utils/dist/src/types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { ChainlinkStripePaymaster } from "../lib/ChainlinkStripePaymaster";
import { DeterministicDeployer } from "../lib/infinitism/DeterministicDeployer";
import { LinkWalletAPI } from "../lib/LinkWalletAPI";
import { ChainlinkStripePaymaster__factory, LinkWalletDeployer__factory } from "../typechain-types";

describe("LinkWallet", function () {
  async function fixture() {
    const provider = ethers.provider;
    const [signer, owner] = await ethers.getSigners();
    const beneficiary = await signer.getAddress();
    const entryPoint = await new EntryPoint__factory(signer).deploy(1, 1);
    const recipient = await new SampleRecipient__factory(signer).deploy();
    const factoryAddress = await DeterministicDeployer.deploy(LinkWalletDeployer__factory.bytecode);

    return { provider, signer, owner, beneficiary, recipient, factoryAddress, entryPoint };
  }

  it("without paymaster", async () => {
    const { provider, signer, owner, beneficiary, recipient, factoryAddress, entryPoint } = await fixture();
    const api = new LinkWalletAPI({
      provider,
      entryPointAddress: entryPoint.address,
      owner,
      factoryAddress,
    });
    const walletAddress = await api.getWalletAddress();
    expect(await provider.getCode(walletAddress).then((code) => code.length)).to.equal(2);
    await signer.sendTransaction({
      to: walletAddress,
      value: ethers.utils.parseEther("0.1"),
    });
    const op = await api.createSignedUserOp({
      target: recipient.address,
      data: recipient.interface.encodeFunctionData("something", ["hello"]),
    });
    await expect(entryPoint.handleOps([op], beneficiary))
      .to.emit(recipient, "Sender")
      .withArgs(anyValue, walletAddress, "hello");
    expect(await provider.getCode(walletAddress).then((code) => code.length)).to.greaterThan(1000);
  });

  it("with paymaster", async () => {
    const { provider, signer, owner, beneficiary, recipient, factoryAddress, entryPoint } = await fixture();

    const deployPaymasterArgument = ethers.utils.defaultAbiCoder.encode(["address"], [entryPoint.address]);
    const paymasterCreationCode = ethers.utils.solidityPack(
      ["bytes", "bytes"],
      [ChainlinkStripePaymaster__factory.bytecode, deployPaymasterArgument]
    );
    const paymasterAddress = await DeterministicDeployer.deploy(paymasterCreationCode);
    const paymasterAPI = new ChainlinkStripePaymaster(paymasterAddress);

    const api = new LinkWalletAPI({
      provider,
      entryPointAddress: entryPoint.address,
      owner,
      factoryAddress,
      paymasterAPI,
    });
    const walletAddress = await api.getWalletAddress();
    expect(await provider.getCode(walletAddress).then((code) => code.length)).to.equal(2);
    await signer.sendTransaction({
      to: walletAddress,
      value: ethers.utils.parseEther("0.1"),
    });
    const op = await api.createSignedUserOp({
      target: recipient.address,
      data: recipient.interface.encodeFunctionData("something", ["hello"]),
    });
    await expect(entryPoint.handleOps([op], beneficiary))
      .to.emit(recipient, "Sender")
      .withArgs(anyValue, walletAddress, "hello");
    expect(await provider.getCode(walletAddress).then((code) => code.length)).to.greaterThan(1000);
  });
});
