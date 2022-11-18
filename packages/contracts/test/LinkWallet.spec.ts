/* eslint-disable camelcase */
import { SampleRecipient__factory } from "@account-abstraction/utils/dist/src/types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { BASE_URI, JOB_ID, SUBSCRIPTION_FEE_IN_USD } from "../config";
import { ChainlinkStripePaymaster } from "../lib/ChainlinkStripePaymaster";
import { DeterministicDeployer } from "../lib/infinitism/DeterministicDeployer";
import { LinkWalletAPI } from "../lib/LinkWalletAPI";
import networkJsonFile from "../network.json";
// Using EntryPoint__factory for debug
import {
  ChainlinkStripePaymaster__factory,
  EntryPoint__factory,
  IERC20__factory,
  LinkWalletDeployer__factory,
} from "../typechain-types";
import { ADDRESS_1, BYTES32_1 } from "./helper/dummy";

describe("LinkWallet", function () {
  async function fixture() {
    const provider = ethers.provider;
    const [signer, walletOwner, paymasterOwner] = await ethers.getSigners();
    const beneficiary = await signer.getAddress();
    const entryPoint = await new EntryPoint__factory(signer).deploy(1, 1);
    const recipient = await new SampleRecipient__factory(signer).deploy();
    const factoryAddress = await DeterministicDeployer.deploy(LinkWalletDeployer__factory.bytecode);
    return { provider, signer, walletOwner, paymasterOwner, beneficiary, recipient, factoryAddress, entryPoint };
  }

  if (process.env.IS_INTEGRATION_TEST !== "true") {
    it("without paymaster", async () => {
      const { provider, signer, walletOwner, beneficiary, recipient, factoryAddress, entryPoint } = await fixture();
      const api = new LinkWalletAPI({
        provider,
        entryPointAddress: entryPoint.address,
        owner: walletOwner,
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
      const { provider, walletOwner, paymasterOwner, beneficiary, recipient, factoryAddress, entryPoint } =
        await fixture();
      const deployPaymasterArgument = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "address", "address", "address", "bytes32", "uint256", "string"],
        // chainlink data is dummy for the local testing
        [entryPoint.address, paymasterOwner.address, ADDRESS_1, ADDRESS_1, ADDRESS_1, BYTES32_1, 0, ""]
      );
      const paymasterCreationCode = ethers.utils.solidityPack(
        ["bytes", "bytes"],
        [ChainlinkStripePaymaster__factory.bytecode, deployPaymasterArgument]
      );
      const paymasterAddress = await DeterministicDeployer.deploy(paymasterCreationCode);
      const paymasterAPI = new ChainlinkStripePaymaster(paymasterAddress);
      const api = new LinkWalletAPI({
        provider,
        entryPointAddress: entryPoint.address,
        owner: walletOwner,
        factoryAddress,
        paymasterAPI,
      });
      const paymaster = ChainlinkStripePaymaster__factory.connect(paymasterAddress, paymasterOwner);
      // IMPORTANT: this is the setup for the paymaster
      await paymaster.deposit({ value: ethers.utils.parseEther("0.1") });
      await paymaster.addStake(0, { value: ethers.utils.parseEther("0.1") });
      const walletAddress = await api.getWalletAddress();
      await paymaster.testDeposit(walletOwner.address, { value: ethers.utils.parseEther("0.1") });
      expect(await provider.getCode(walletAddress).then((code) => code.length)).to.equal(2);
      const op = await api.createSignedUserOp({
        target: recipient.address,
        data: recipient.interface.encodeFunctionData("something", ["hello"]),
      });
      await expect(entryPoint.handleOps([op], beneficiary))
        .to.emit(recipient, "Sender")
        .withArgs(anyValue, walletAddress, "hello");
      expect(await provider.getCode(walletAddress).then((code) => code.length)).to.greaterThan(1000);
    });
  }

  if (process.env.IS_INTEGRATION_TEST === "true") {
    const chainId = process.env.FORK_CHAIN_ID;
    if (chainId !== "80001") {
      throw new Error("chain id invalid");
    }
    it("chain link test", async () => {
      const { signer, paymasterOwner, entryPoint } = await fixture();
      const { link, oracle, priceFeed } = networkJsonFile[chainId].contracts;
      const deployPaymasterArgument = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "address", "address", "address", "bytes32", "uint256", "string"],
        // this address data is dummy for local testing
        [entryPoint.address, paymasterOwner.address, link, oracle, priceFeed, JOB_ID, SUBSCRIPTION_FEE_IN_USD, BASE_URI]
      );
      const paymasterCreationCode = ethers.utils.solidityPack(
        ["bytes", "bytes"],
        [ChainlinkStripePaymaster__factory.bytecode, deployPaymasterArgument]
      );
      const paymasterAddress = await DeterministicDeployer.deploy(paymasterCreationCode);
      const paymaster = ChainlinkStripePaymaster__factory.connect(paymasterAddress, paymasterOwner);
      const subscriptionFeeInUSD = await paymaster.subscriptionFeeInUSD();
      const ethWeiForSevenUSD = await paymaster.getCurrentEthAmountForSubscription(subscriptionFeeInUSD);
      // this works
      console.log(`${subscriptionFeeInUSD} USD is equivalent to ${ethers.utils.formatEther(ethWeiForSevenUSD)} ETH`);
      const subscriptionId = "subscriptionId";
      const requestURI = await paymaster.getRequestURI(subscriptionId);
      console.log("requestURI", requestURI);
      expect(requestURI).to.equal(`${BASE_URI}${subscriptionId}`);
      // this signer should have LINK token in forked environment
      const linkTokenContract = IERC20__factory.connect(link, signer);
      await linkTokenContract.transfer(paymaster.address, ethers.utils.parseEther("0.1"));
      await expect(paymaster.request(subscriptionId))
        .to.emit(paymaster, "Requested")
        .withArgs(subscriptionId, anyValue);
    });
  }
});
