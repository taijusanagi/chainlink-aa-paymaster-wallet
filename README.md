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

- Users can pay the gas fee by offchain subscription
- It enables users to skip "bridge token from the other chain" or "send token from the central exchange", which is the first obstacle for users to start using a blockchain-based app
- It brings very good onboarding, especially for the new user

## How it works

![how-it-works](./docs/how-it-works.png)

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

## Deployed Contract

### ChainlinkStripePaymaster

https://mumbai.polygonscan.com/address/0xfaf0064bc2d8abeb1bbfacee7f981d2ee9a15945#code

- This is the main development

#### Deposit

https://mumbai.polygonscan.com/tx/0x7e11930e686280e6fc74fd295f8bec94c1d24bbc4c07de43dadf7cfbeabc1003

#### Stake

https://mumbai.polygonscan.com/tx/0x352bf1f636e06378ce95a17a949fa95b716df4d8073022830ed174eddbd27f29

#### Link Deposit

https://mumbai.polygonscan.com/tx/0x57260315542e080a10ea531cb43c799c272a76904c2878aa4acba00790b6d63f

### EntryPoint

https://mumbai.polygonscan.com/address/0xf317c52db727f9d8a3ac04304cb34a297bffef9a#code

- This is required for the Account Abstraction setup
- This EntryPoint handle the user request

### WalletFactory

https://mumbai.polygonscan.com/address/0x5352d8704b9a251d46aa4674e3215fc6d7baa80a#code

- This is required for the Account Abstraction setup
- This wallet factory makes the Account Abstraction wallet address ounterfactual by create2

## Other Information

### Stripe Test

https://stripe.com/docs/testing

## Development

- must have Metamask
- must run with an internet connection

```
git submodule update --init --recursive
yarn
yarn dev
```
