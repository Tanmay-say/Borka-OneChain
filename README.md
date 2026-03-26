# BORKA

BORKA is a browser platformer with optional OneChain integration.

This README is written to match the current repository state and deployed contract. It is intended as a human-maintained project document, not a generated promo page. If the code changes, this file should be updated with the same standard: describe what is actually implemented, what is deployed, and what still requires manual operation.

## What This Project Is

The project has two parts:

1. A React frontend in `frontend/`
2. A Move smart contract in `contracts/`

The frontend runs as a single-screen canvas platformer with wallet connection, leaderboard display, score submission, and a separate on-chain claim action. The contract stores leaderboard entries on OneChain testnet in a shared object.

## Current Deployed Contract

The current frontend is configured for this deployed testnet package:

- Package ID: `0x72c3ef7bfb2ece4ac9b919fdd9d5660625ea4aec9a0e402d4eea85bb26061808`
- Leaderboard ID: `0x4f9151213ed94e92dd7ea1995b6763a4b845dd0d99779c26593b35c58a19c748`
- Publish transaction digest: `2MQPAYTR2ETxASJVoPGc4b1Lh395H49ZhZi2cDN4XQsx`

These values are already set in `frontend/.env`.

## Tech Stack

- Frontend: React 18, CRACO, Canvas API
- Wallet / chain client: `@onelabs/dapp-kit`, `@onelabs/sui`
- Smart contract: Move on OneChain
- Network target: OneChain testnet

## Repository Layout

```text
.
├── contracts/
│   ├── Move.toml
│   └── sources/
│       └── borka_game.move
├── frontend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       └── lib/
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm start
```

Production build:

```bash
cd frontend
npm run build
```

### Contract

You need a working `one` CLI binary.

Build the package:

```bash
cd contracts
one move build --force
```

Publish with the active OneChain wallet:

```bash
cd contracts
one client publish --gas-budget 500000000
```

After publishing, copy the new package ID and shared leaderboard object ID into `frontend/.env`.

## Environment Variables

The frontend currently uses:

```env
REACT_APP_ONECHAIN_RPC=https://rpc-testnet.onelabs.cc:443
REACT_APP_ONECHAIN_NETWORK=testnet
REACT_APP_ONECHAIN_EXPLORER=https://onescan.cc/testnet
REACT_APP_PACKAGE_ID=0x72c3ef7bfb2ece4ac9b919fdd9d5660625ea4aec9a0e402d4eea85bb26061808
REACT_APP_LEADERBOARD_ID=0x4f9151213ed94e92dd7ea1995b6763a4b845dd0d99779c26593b35c58a19c748
GENERATE_SOURCEMAP=false
```

## Gameplay Flow

The game is a level-based platformer. The player controls Boris and moves through 8 levels in sequence.

Core loop:

1. Start at the intro screen.
2. Choose a level or begin from level 1.
3. Move with arrow keys or `A` / `D`.
4. Jump with `Space`, `W`, or `ArrowUp`.
5. Survive traps, reach the exit door, and collect coins on the way.
6. On level completion, the next level unlocks.
7. After level 8, the game enters the win state.
8. If a wallet is connected, the frontend submits the final run to chain.

The player can still play the game without a wallet. Wallet connection only affects blockchain features.

## Level Flow

The 8 levels currently implemented are:

1. `Easy?` - introduces floor-drop traps
2. `Watch Your Step` - introduces spikes and moving hazards
3. `Trust Issues` - introduces fake platforms
4. `Keep Moving` - introduces moving platforms
5. `Down Is Up` - introduces gravity flip behavior
6. `Speed Run` - increases tempo with collapsing sections
7. `Closing In` - introduces pressure from moving wall logic
8. `Devil's Den` - combines previous mechanics

The game logic, trap handling, level transitions, and render loop are all in `frontend/src/components/BorkaGame.jsx`.

## Scoring

The frontend computes leaderboard score as:

```text
score = (coins * 100) - (deaths * 50)
```

What is tracked during a run:

- Total collected coins
- Total deaths
- Completion time in milliseconds

When the player finishes the final level with a connected wallet, the frontend calls:

- `submit_score(coins, deaths, time_ms)`

The leaderboard UI then reads the shared leaderboard object and sorts entries locally by the same computed score.

## Wallet Flow

The current wallet flow is simple:

1. The app asks `@onelabs/dapp-kit` for available wallets.
2. Clicking the wallet button connects the first available wallet.
3. Disconnecting is done from the same button.
4. When connected, the button shows the short wallet address.

The frontend expects a OneWallet-compatible browser wallet on OneChain testnet.

## Smart Contract Design

The Move contract lives in `contracts/sources/borka_game.move`.

The module creates one shared `Leaderboard` object during package initialization.

### Stored Types

`ScoreEntry`

- `player: address`
- `coins: u64`
- `deaths: u64`
- `time_ms: u64`

`Leaderboard`

- `id: UID`
- `entries: vector<ScoreEntry>`
- `max_entries: u64`

### Initialization

When the package is published, `init` creates a `Leaderboard` object and shares it on-chain.

That shared object is the object configured in `REACT_APP_LEADERBOARD_ID`.

### `submit_score`

Signature:

```move
public fun submit_score(
    board: &mut Leaderboard,
    coins: u64,
    deaths: u64,
    time_ms: u64,
    ctx: &mut TxContext,
)
```

Behavior:

- Reads the transaction sender from `TxContext`
- Creates a new `ScoreEntry`
- Removes the sender's previous entry if one already exists
- Caps storage to `max_entries`
- Pushes the new entry into the leaderboard

Important detail:

- The contract stores raw run data
- The sorting formula is applied in the frontend when rendering the leaderboard

### `claim_tokens`

Signature:

```move
public fun claim_tokens(
    board: &mut Leaderboard,
    coins: u64,
    ctx: &mut TxContext,
)
```

Current behavior:

- Executes an on-chain call
- Does not transfer OCT
- Acts only as a proof-of-claim transaction pattern

This means the current repo does not contain an on-chain reward distribution system. Any real token reward logic would need additional contract or backend infrastructure.

## Frontend Chain Integration

Chain access is split across these files:

- `frontend/src/lib/onechain.js`
  Defines RPC URL, package ID, leaderboard ID, explorer URL, and score helper.

- `frontend/src/hooks/useOneChain.js`
  Builds and signs transactions for `submit_score` and `claim_tokens`, and fetches the leaderboard object.

- `frontend/src/components/Leaderboard.jsx`
  Loads the shared object from chain and renders the top entries.

- `frontend/src/contexts/WalletContext.js`
  Holds connected wallet state for the app.

## What Is Actually Implemented

Implemented now:

- Playable 8-level browser game
- Keyboard and touch input support
- Wallet connect / disconnect button
- Automatic score submission after final level completion if a wallet is connected
- On-chain shared leaderboard object
- Manual claim transaction call
- Frontend build that compiles successfully
- Contract build and publish flow that works against OneChain testnet

Not implemented in this repo:

- Automatic OCT payout logic on-chain
- Backend reward processor
- Persistent off-chain player profiles
- Admin tools
- Matchmaking or multiplayer

## Known Operational Notes

- `claim_tokens` is not a token mint or transfer function. It is only a transaction call.
- The README and deployment guide should be updated whenever package IDs or contract behavior change.
- The dev server may fail inside restricted sandboxes that do not allow binding to `0.0.0.0:3000`. That is an environment restriction, not an application compile error.

## Verification Status

Verified in this repository state:

- `npm run build` in `frontend/` succeeds
- `one move build --force` in `contracts/` succeeds
- Contract publish to OneChain testnet succeeded with the package and leaderboard IDs listed above

## Deployment Guide

For wallet import, CLI setup, and republishing steps, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## License

MIT
