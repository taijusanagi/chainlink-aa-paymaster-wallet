// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";

import "hardhat/console.sol";

contract ChainlinkStripePaymaster is Ownable, BasePaymaster {
  // owner should be set here because of the DeterministicDeployer limitation
  constructor(IEntryPoint anEntryPoint, address owner_) BasePaymaster(anEntryPoint) {
    transferOwnership(owner_);
  }

  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 requestId,
    uint256 maxCost
  ) external view override returns (bytes memory context) {
    console.log("validatePaymasterUserOp");

    // add validate
    // _postOp is called only context is set
    return abi.encode("ok");
  }

  function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) internal override {
    console.log("_postOp");
    // add substract
  }
}
