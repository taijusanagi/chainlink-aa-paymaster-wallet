# Capsule Wallet

!["logo"](./packages/app/public/img/logo.png)

## Description

We are excited to introduce the Capsule Wallet, a secure wallet manager powered by Account Abstraction and Burner Wallet.

The Capsule Wallet utilizes Burner Wallet to minimize security risks from hacking and provides a better UX for users by Account Abstraction.

With the Capsule Wallet, you can manage your accounts with ease and confidence, knowing that your asset is safe and secure. So why wait? Get the Capsule Wallet today!

## How it works

- Capsule Wallet is Encapsulated security layer of your wallet

!["concept"](./docs/concept.png)

- One way to minimize the risk of losing all funds is to create a burner wallet
- It's too much work to manage!!

!["burner-wallet"](./docs/burner-wallet.png)

- Better security without loosing userbility! That’s Account Abstraction!!
- Main case is second check of the transaction before sending it

!["account-abstraction"](./docs/account-abstraction.png)

## Deployed Contracts

Contract address is calculated by create2 factory, this enables to have same contract address in every chain.

### CapsuleWalletDeployer

https://goerli.etherscan.io/address/0xea6b837f02f6f6f426d9a145d583eedf6ee9e959#code

### NFTDrop for Test

https://goerli.etherscan.io/address/0x2280c6db79ce3bc7eee56934fd2d8a5ba6b10fda#writeContract

## Pitch Deck

https://docs.google.com/presentation/d/1UVNxJmL83hINHz8diepNhaDMs_nqySxBBKR3o0Od2cI/edit?usp=sharing

## Presentation Video

https://youtu.be/mqysPAE8k8Y

## Development

This repo is using yarn monorepo

### Local

Set mnemonic.txt at project root then

```
yarn
yarn dev
```

### Design

- Should utilize [Chakra UI Pro](https://pro.chakra-ui.com/)

- Should utilize [Chakra UI blue theme](https://chakra-ui.com/docs/styled-system/theme#blue)

- Should utilize images with #3182CE (equivalent to blue.500 in Chakra UI) in [unDraw](https://undraw.co/)
