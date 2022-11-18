// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract ChainlinkStripePaymaster is Ownable, ChainlinkClient, BasePaymaster {
  using Chainlink for Chainlink.Request;

  // bytes32 private _jobId;

  // owner should be set here because of the DeterministicDeployer limitation
  constructor(
    IEntryPoint anEntryPoint,
    address owner_,
    address link,
    address oracle
  ) BasePaymaster(anEntryPoint) {
    transferOwnership(owner_);
    setChainlinkToken(link);
    setChainlinkOracle(oracle);
  }

  mapping(address => uint256) public deposits;

  // this is for manual deposit for testing, this should be automated by chainlink for prod
  function testDeposit(address account) public payable {
    deposits[account] = deposits[account] + msg.value;
  }

  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 requestId,
    uint256 maxCost
  ) external view override returns (bytes memory context) {
    // this is Account Abstraction wallet address
    address account = userOp.sender;
    // Actually Subscription can be managed by Account Abstraction wallet level
    // However, for this hackathon, subscription is managed by user op signer == metamask
    address signer = Ownable(account).owner();
    // should check with the stripe payment status
    require(deposits[signer] > maxCost, "ChainlinkStripePaymaster: deposit is not enough");

    return abi.encode(signer);
  }

  function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) internal override {
    address account = abi.decode(context, (address));
    // deduct fee from the account
    deposits[account] = deposits[account] - actualGasCost;
  }
}
