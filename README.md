# Link Wallet

Offchain Payable Account Abstraction with Chainlink

![top-screen-shot](./docs/top-screen-shot.png)

## Submission

This is for [Chainlink 2022 Fall Hackathon](https://chain.link/hackathon)

### Demo Video

TBD

### Live App

TBD

## User Benefits

- Users can pay Offchain gas-fee when start using Polygon
- It enables users to skip "bridge token from the other chain" or "send token from the central exchange", which is the first obstacle for users to start using a blockchain-based app
- It brings very good onboarding, especially for the new user

## How it works

![how-it-works]

- The blue part is the main implementation of the hackathon
- Payment status is integrated securely with [Chainlink External Adapters](https://docs.chain.link/chainlink-nodes/external-adapters/external-adapters)
- Verification is implemented in an Account Abstraction way which brings better flexibility than the normal meta transaction

Implementation details are the followings.

### Chainlink Integration

- To integrate stripe payment status to the Polygon Mumbai
- The Main reference of the integration
  - https://docs.chain.link/chainlink-nodes/external-adapters/external-adapters

### Paymaster

- To pay the gas fee for users after verifying the stripe payment status
- The main reference of the integration
  - https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/DepositPaymaster.sol

### Stripe Integration

- To manage user payment for the gas fee
- The Main reference of the integration
  - https://github.com/thirdweb-example/thirdweb-stripe

## Development

- must have Metamask
- must run with an internet connection

```
git submodule update --init --recursive
yarn
yarn dev
```
