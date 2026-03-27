# BORKA — GameFi Platformer on OneChain

A browser-based platformer with on-chain leaderboard, token rewards, and NFT skins on OneChain OCT testnet.

## What's implemented

- 8-level canvas platformer (traps, fake platforms, gravity flip, moving spikes)
- OneWallet connect via @onelabs/dapp-kit
- On-chain leaderboard (shared Move object, top 10 scores)
- Score submission on run completion
- 1 OCT token claim per completed run
- 4 Boris skin variants (Default, Fire, Ice, Shadow)
- Devil Boris NFT skin minted after completing all 8 levels

## Deployed contract

- Package: set in `frontend/.env` as `REACT_APP_PACKAGE_ID`
- Leaderboard: set in `frontend/.env` as `REACT_APP_LEADERBOARD_ID`
- Mint Registry: set in `frontend/.env` as `REACT_APP_MINT_REGISTRY_ID`
- Network: OneChain OCT Testnet (`https://onescan.cc/testnet`)

## Local setup

```bash
cd frontend
yarn install
yarn start
```

## Contract deploy

```bash
cd contracts
one move build --force
one client publish --gas-budget 200000000 --skip-dependency-verification
```

## Score formula

`score = coins × 100 − deaths × 50`

Higher coins and fewer deaths give a better rank.

## Token reward

1 OCT token per completed run. The on-chain claim transaction is the proof of claim for the current MVP flow.
