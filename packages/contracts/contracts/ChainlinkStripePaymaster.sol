// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";

import "hardhat/console.sol";

contract ChainlinkStripePaymaster is Ownable, BasePaymaster {
  constructor(IEntryPoint anEntryPoint) BasePaymaster(anEntryPoint) {}

  receive() external payable {}

  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 requestId,
    uint256 maxCost
  ) external view override returns (bytes memory context) {
    console.log("paymaster");
    // add validate
    return abi.encode();
  }

  function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) internal override {
    console.log("paymaster");
    // add substract
  }
}
