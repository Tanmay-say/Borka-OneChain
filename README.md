# 🎮 BORKA - GameFi DApp on OneChain OCT

> A platformer where nothing is as it seems... except the blockchain!

BORKA is a Web3 game that combines classic platforming mechanics with on-chain leaderboards and token rewards on OneChain OCT testnet.

![BORKA Game](https://img.shields.io/badge/OneChain-GameFi-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Move](https://img.shields.io/badge/Move-Smart%20Contract-4B32C3)

---

## ✨ Features

### 🎯 Gameplay
- **8 Challenging Levels** with unique mechanics
- **Double-jump** platforming action
- **Traps & Obstacles**: Floor drops, spikes, fake platforms, gravity flips
- **Coin Collection** system for scoring
- **Death Counter** - every mistake counts!

### ⛓️ Blockchain Integration
- **On-Chain Leaderboard** - immutable proof of high scores
- **Score Submission** - automatic when all levels complete
- **Token Claims** - earn OCT tokens based on performance
- **Wallet Integration** - OneWallet browser extension
- **Graceful Degradation** - game works without wallet connection

### 🎨 Design
- Custom-drawn Boris character with animations
- Particle effects and screen shake
- Smooth 60 FPS canvas rendering
- Retro pixel-art aesthetic with modern polish

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 16
yarn
One CLI
OneWallet browser extension
```

### Installation
```bash
# Install dependencies
cd /app/frontend
yarn install

# Start development server
yarn start
```

### Deploy Smart Contract
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

```bash
# Quick deploy
cd /app/contracts
one move build
one client publish --gas-budget 100000000
```

---

## 📁 Project Structure

```
/app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BorkaGame.jsx       # Main game component
│   │   │   ├── WalletButton.jsx    # Wallet connect UI
│   │   │   └── Leaderboard.jsx     # On-chain leaderboard
│   │   ├── contexts/
│   │   │   └── WalletContext.js    # Wallet state management
│   │   ├── hooks/
│   │   │   └── useOneChain.js      # Blockchain hooks
│   │   ├── lib/
│   │   │   └── onechain.js         # OneChain SDK config
│   │   └── App.js                  # App with providers
│   └── .env                        # Contract addresses
├── contracts/
│   ├── borka_game.move             # Move smart contract
│   └── Move.toml                   # Package config
└── DEPLOYMENT_GUIDE.md             # Full deployment guide
```

---

## 🎮 How to Play

### Controls
- **Arrow Keys / WASD**: Move left/right
- **Space / ↑ / W**: Jump (double-jump enabled!)

### Objective
1. Complete all 8 levels
2. Collect coins 🪙
3. Avoid traps 💀
4. Reach the golden door
5. Submit your score to the blockchain
6. Claim OCT tokens!

### Levels
1. **Easy?** - Floor drops
2. **Watch Your Step** - Rising spikes
3. **Trust Issues** - Fake platforms
4. **Keep Moving** - Moving platforms
5. **Down Is Up** - Gravity flip
6. **Speed Run** - Crumbling platforms
7. **Closing In** - Moving wall
8. **Devil's Den** - All mechanics combined!

---

## ⛓️ Smart Contract

### Functions

#### `submit_score`
```move
public entry fun submit_score(
    board: &mut Leaderboard,
    coins: u64,
    deaths: u64,
    time_ms: u64,
    ctx: &mut TxContext,
)
```
Submits player score to on-chain leaderboard. Replaces previous score from same wallet.

#### `claim_tokens`
```move
public entry fun claim_tokens(
    board: &mut Leaderboard,
    coins: u64,
    ctx: &mut TxContext,
)
```
Proof-of-claim transaction for OCT token rewards.

### Scoring
```
Score = (Coins × 100) - (Deaths × 50)
```

---

## 🔧 Tech Stack

### Frontend
- **React 19** - UI framework
- **Canvas API** - Game rendering
- **@onelabs/dapp-kit** - Wallet connection
- **@onelabs/sui** - RPC client & transactions
- **@tanstack/react-query** - State management

### Smart Contract
- **Move Language** - OneChain smart contracts
- **Sui Framework** - Base libraries

### Blockchain
- **OneChain OCT Testnet** - Sui-fork L1
- **OneWallet** - Browser wallet extension

---

## 🌐 Deployment

### Frontend
Currently deployed at:
```
https://borka-game.preview.emergentagent.com
```

### Contract
Deployed to OneChain Testnet. See `.env` for addresses.

---

## 📖 Documentation

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [OneChain Docs](https://docs.onelabs.cc)
- [Move Language Guide](https://move-language.github.io/move/)

---

## 🐛 Troubleshooting

### Game won't connect to wallet
- Ensure OneWallet extension is installed
- Network must be set to **Testnet**
- Try refreshing the page

### Leaderboard not loading
- Check contract IDs in `.env`
- Verify `REACT_APP_LEADERBOARD_ID` is set
- Restart frontend server

### Transaction failing
- Ensure wallet has testnet OCT
- Check gas budget is sufficient
- Verify contract addresses are correct

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more solutions.

---

## 🤝 Contributing

This is a hackathon project for OneChain. Feel free to:
- Report bugs
- Suggest features
- Submit PRs

---

## 📜 License

MIT License - feel free to use this code for learning and building!

---

## 🎯 Roadmap

Future enhancements:
- [ ] NFT rewards for achievements
- [ ] Tournament mode with prize pools
- [ ] Level editor and community levels
- [ ] Mainnet deployment
- [ ] Mobile app version
- [ ] Multiplayer race mode

---

## 🙏 Acknowledgments

- OneChain team for the hackathon
- Sui/Move community for great docs
- Original "Level Devil" game for inspiration

---

## 📞 Support

- Discord: [OneChain Discord](https://discord.gg/onelabs)
- Twitter: [@OneLabs](https://twitter.com/onelabs)
- Docs: [docs.onelabs.cc](https://docs.onelabs.cc)

---

**Made with ❤️ for OneChain Hackathon**

*Boris says: "The only way out is through... and up... and sideways... and upside down! 🔵"*
