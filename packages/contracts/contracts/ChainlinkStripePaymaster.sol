// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract ChainlinkStripePaymaster is Ownable, ChainlinkClient, BasePaymaster {
  using Chainlink for Chainlink.Request;

  event SubscriptionCreatedOrRenewed(bytes32 indexed requestId, address indexed account, uint256 volume);

  // this is constant for the hackathon
  uint256 public constant subscriptionFeeInUSD = 7; // 7 USD

  bytes32 private _jobId;

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

  /*
   * Chainlink Implementation
   */

  function request() public returns (bytes32 requestId) {
    Chainlink.Request memory req = buildChainlinkRequest(_jobId, address(this), this.fulfill.selector);
  }

  function fulfill(
    bytes32 requestId,
    address account,
    uint256 value
  ) public recordChainlinkFulfillment(requestId) {
    // this should calculate
    uint256 amount = getCurrentEthAmountForSubscription(subscriptionFeeInUSD);
    deposits[account] = deposits[account] + amount;
    emit SubscriptionCreatedOrRenewed(requestId, account, amount);
  }

  function getCurrentEthAmountForSubscription(uint256 amount) public view returns (uint256) {
    // this should use chain link price feed
    return amount * 714000000000000;
  }

  /*
   * Account Abstraction Paymater Implementation
   */

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
