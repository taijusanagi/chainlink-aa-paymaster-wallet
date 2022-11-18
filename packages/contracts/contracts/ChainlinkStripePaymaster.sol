// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";

contract ChainlinkStripePaymaster is Ownable, ChainlinkClient, BasePaymaster {
  using Chainlink for Chainlink.Request;

  // subscription Id could be bytes32 or some other light type for strage optimization
  // however, that is not relevant with the core value of product, so use string for this hackathon
  event Requested(string indexed paymentId, bytes32 indexed requestId);
  event SubscriptionCreatedOrRenewed(bytes32 indexed requestId, address indexed account, uint256 volume);
  mapping(string => bool) public isPaymentIdUsed;

  uint256 public subscriptionFeeInUSD;
  address public priceFeed;
  bytes32 public jobId;
  uint256 public fee;
  string public requestBaseURI;

  constructor(
    IEntryPoint anEntryPoint,
    address actualOwner,
    address link,
    address oracle,
    address priceFeed_,
    bytes32 jobId_,
    uint256 subscriptionFeeInUSD_,
    string memory baseURI
  ) BasePaymaster(anEntryPoint) {
    transferOwnership(actualOwner); // owner should be set here because of the DeterministicDeployer
    setChainlinkToken(link);
    setChainlinkOracle(oracle);
    priceFeed = priceFeed_;
    // https://docs.chain.link/any-api/get-request/examples/large-responses/
    // jobId = "7da2702f37fd48e5b1b9a5715e3509b6";
    jobId = jobId_; // ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JOB_ID_STRING));
    fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    subscriptionFeeInUSD = subscriptionFeeInUSD_; // 7 USD
    requestBaseURI = baseURI;
  }

  mapping(address => uint256) public deposits;

  /*
   * Chainlink Implementation
   */

  // this is separated for better test
  function getRequestURI(string memory paymentId) public view returns (string memory) {
    return string(abi.encodePacked(requestBaseURI, paymentId));
  }

  // this is separated for better test
  function getCurrentEthAmountForSubscription(uint256 amount) public view returns (uint256) {
    (, int256 answer, , , ) = AggregatorV3Interface(priceFeed).latestRoundData();
    // this works
    return (amount * (10**8) * 1 ether) / uint256(answer);
  }

  function request(string memory paymentId) public returns (bytes32) {
    // the subscription id is only used once
    require(!isPaymentIdUsed[paymentId], "ChainlinkStripePaymaster: this subscription id is already used");
    Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
    req.add("get", getRequestURI(paymentId));
    req.add("path", "account"); // this is key for the payer address
    bytes32 requestId = sendChainlinkRequest(req, fee);
    emit Requested(paymentId, requestId);
    return requestId;
  }

  function fulfill(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
    // get account from bytes
    address account = address(bytes20(bytesData));
    // take current ETH value in wei for subscriptionFeeInUSD
    uint256 amount = getCurrentEthAmountForSubscription(subscriptionFeeInUSD);
    deposits[account] = deposits[account] + amount;
    emit SubscriptionCreatedOrRenewed(requestId, account, amount);
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
