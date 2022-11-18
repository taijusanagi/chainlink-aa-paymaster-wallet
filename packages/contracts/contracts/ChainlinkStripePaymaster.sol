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
    // this is Account Abstraction User Operation Signer Address
    address account = userOp.sender;
    console.log(account);
    // should check with the stripe payment status

    return abi.encode(account);
  }

  function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) internal override {
    address account = abi.decode(context, (address));

    console.log("_postOp");
    console.log(account);
    // should substract with the stripe payment status
  }
}
