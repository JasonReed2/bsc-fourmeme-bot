![](assets/fourmeme-bot.png)

## BSC FourMeme Bot

FourMeme(four.meme) BNB Bundler & Volume bot is a modular, CLI-driven trading toolkit tailored for the Four.meme ecosystem on BNB Chain. It includes specialized modules for mirroring wallets, batching routes, and simulating/measuring volume — all powered directly on-chain with no third‑party market data services.


## Modules at a glance
- **Bundler**: Execute predefined swap routes (e.g., `WBNB → TOKEN`) with timing controls; designed to extend toward multicalls.
- **Volume Bot**: Programmatic buy/sell loops at a set cadence for liquidity/organic activity testing.
- **Notifications**: Optional Telegram alerts for major lifecycle events.
- **Risk Controls**: Allow/deny lists, max spend ceilings, and basic MEV‑aware settings.

## How it works

### Bundler flow
- Read a sequence of routes from config → execute each respecting slippage/deadline settings → suitable base for multicall-style extensions.

### Volume Bot flow
- Loop on an interval → small buys → approve when needed → partial or full sells → repeat with built‑in rate limiting.

## Getting started

### Prerequisites
- [Node.js 22.15](https://nodejs.org/en/download) or newer
- A BNB Chain RPC endpoint (The default RPC can be used)
- A funded wallet private key (BNB)

### Install dependencies
```bash
npm install
```

### Environment setup
Copy `.env.example` to `.env` and populate the required values. RPC/PancakeV2/WBNB mainnet defaults are provided. To enable Telegram notifications (optional), add:
```
TELEGRAM_BOT_TOKEN=794431:AAH72RqUaevy_nk7BttAGVEqAXXXXXXX
TELEGRAM_CHAT_ID=1002184XXXXXX
```

### Sample configurations
You can start from the provided examples and tailor them to your needs. If using the sniper feature, replace the “0xTokenAddressHere” placeholder with the target token address. If using the copy transaction feature, replace “0xLeaderWalletAddress” in the config.copy.example.json file with the public wallet address of the trader you deem optimal, such as a KOL. Other data can be adjusted as needed, such as the BNB amount. :
- `config.copy.example.json`
- `config.sniper.example.json`
- `config.bundle.example.json`
- `config.volume.example.json`

## Project Construction
```bash
npm run build

```


## Start using it as needed
```bash
# Copy-trader
node dist/index.js copy -c config.copy.example.json

# Sniper (dry-run recommended first)
node dist/index.js sniper -c config.sniper.example.json --dry-run

# Bundler
node dist/index.js bundle -c config.bundle.example.json

# Volume bot
node dist/index.js volume -c config.volume.example.json
```

Tip: All commands accept standard Node/CLI flags and module‑specific options (see inline `--help`).

## Configuration and safety tips
- Start in dry‑run mode; scale notional size gradually.
- Maintain deny lists and confirm token/router addresses before enabling live trades.
- For fast markets, sniper slippage of 3–8% (300–800 bips) is common; test first.
- For copy‑trading, set both per‑trade caps and a daily max exposure.

## Security best practices
- Never commit secrets or private keys.
- Use a dedicated hot wallet for experimentation.
- Double‑check token and router contract addresses.
- Prefer dry‑run first, then small sizes in production.


## Contact and Donations
1. Based on the past month's performance, copying profitable KOLs or top traders using the “config.copy.example.json” feature has been the most profitable strategy, though I'm unsure how long this trend will last. Regardless, if this program helps you, donations and stars are what keep me motivated to keep updating it!

- `0xde785F1d460435D8a6EDaEc000Abecc1E06F2BFD` 

2. If you have any suggestions, they would be extremely helpful for my next update! The best way to contact me is to send an email to:

- `jasonreed2001@gmail.com` 
