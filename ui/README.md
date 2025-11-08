# Secret Vote Box — UI (Vite + React + Wagmi)

Frontend for the Community Governance DApp powered by FHEVM (Fully Homomorphic Encryption VM). While a poll is active, individual choices and the total vote count stay encrypted on-chain; once a poll ends, decrypted per-option results become public without revealing voter identities.


## Features

- Privacy-first voting (encrypted choices and totals while active)
- On-chain finalization after expiry with public per-option counts
- Wallet connection via RainbowKit/Wagmi
- Multi-network support: Localhost (Hardhat 31337) and Sepolia (11155111)
- Modern UI with Tailwind + shadcn/ui components


## Tech Stack

- React 18, TypeScript, Vite
- Wagmi + Viem + Ethers v6
- RainbowKit
- Tailwind CSS + shadcn/ui
- FHEVM SDKs (`@fhevm/sdk`, `@zama-fhe/relayer-sdk`)


## Prerequisites

- Node.js >= 20
- A Web3 wallet (e.g., MetaMask)
- An available RPC for your target network(s):
  - Local: Hardhat node at `http://localhost:8545`
  - Sepolia: `https://rpc.sepolia.org` (default in this project)


## Quick Start

```bash
# From repository root, start contracts (optional but recommended if working locally)
# npx hardhat node
# npx hardhat deploy --network localhost

cd ui
npm install
npm run dev
```

- Open the app at `http://localhost:8080` (the dev server port is pinned in Vite config).
- Connect your wallet and ensure your network matches the deployed contract.


## Environment Variables

Create a `.env.local` (or `.env`) in `ui/` to optionally override defaults:

```bash
# Contract address override. If omitted, the UI selects by chainId mapping.
VITE_CONTRACT_ADDRESS=0xYourContractAddress

# WalletConnect project id (optional in local dev; recommended for production)
VITE_WALLET_CONNECT_PROJECT_ID=your_32_char_project_id
```

Notes:
- When `VITE_CONTRACT_ADDRESS` is not provided, the UI uses a network mapping inside `src/lib/contract.ts`. Make sure your contract is deployed to the active network and that the mapping or the env var matches it.
- For local development, WalletConnect may emit 403 logs. The app filters or mocks calls to keep the console quiet.


## Scripts

```bash
npm run dev        # Start Vite dev server (http://localhost:8080)
npm run build      # Production build
npm run build:dev  # Development-mode build (useful for faster CI previews)
npm run preview    # Preview the production build
npm run lint       # Lint the codebase
```


## Network & RPC Configuration

- Chains are defined in `src/lib/wagmi.ts`:
  - Localhost (id: 31337) → `http://localhost:8545`
  - Sepolia (id: 11155111) → `https://rpc.sepolia.org`
- The Vite dev server is configured in `vite.config.ts` to run on port `8080` with COOP/COEP headers required by FHEVM WebAssembly.


## Contract Address Resolution

The frontend tries in this order:
1. Use `VITE_CONTRACT_ADDRESS` if set
2. Otherwise use the chainId mapping defined in `src/lib/contract.ts`

Ensure the address for your active network is correct; otherwise calls will fail with “Contract not found at address …”.


## Directory Structure (UI)

```
ui/
├─ public/                     # Static assets
├─ src/
│  ├─ assets/                  # Images, icons, etc.
│  ├─ components/              # Reusable UI components (incl. shadcn-ui wrappers)
│  ├─ pages/                   # Route-level components (e.g., Index)
│  ├─ lib/                     # Ethereum/FHEVM helpers and config
│  │  ├─ contract.ts           # Contract ABI, addresses, and calls
│  │  ├─ wagmi.ts              # Wagmi/RainbowKit config and chains
│  │  └─ fhevm.ts              # FHEVM instance and encryption helpers (if present)
│  ├─ App.tsx                  # App shell and routes
│  ├─ main.tsx                 # App bootstrap, console and network noise filters
│  └─ index.css                # Global styles
├─ package.json
└─ vite.config.ts
```


## Typical User Flow

1. Open the app and connect your wallet
2. Browse active polls on the home page
3. Click an option to vote; your choice is encrypted and submitted on-chain
4. After the poll expires, the app (or any user) triggers on-chain finalization
5. Once finalized, clear per-option counts and percentages are shown


## Troubleshooting

- WalletConnect 403 or analytics warnings in dev
  - Expected in local environments. The app filters or mocks known third‑party requests (Coinbase metrics, WalletConnect config endpoints) to reduce noise.

- “Contract not found at address …”
  - Ensure you’re on the correct network (localhost vs Sepolia)
  - Verify `VITE_CONTRACT_ADDRESS` or the mapping in `src/lib/contract.ts`
  - For localhost, deploy contracts before starting the UI

- FHEVM / WebAssembly issues
  - Make sure you access the app at `http://localhost:8080` (same origin)
  - The dev server sends COOP/COEP headers required by FHEVM
  - Reload the page after switching networks

- “Already voted”
  - Each address can vote once per poll; check the home page or a “My Votes” page if present


## Build & Deploy

```bash
npm run build
npm run preview   # optional: preview locally
```

Deploy the built `dist/` folder to your static hosting (Vercel, Netlify, S3, etc.). Remember to set environment variables (especially `VITE_CONTRACT_ADDRESS` and `VITE_WALLET_CONNECT_PROJECT_ID`) in your hosting platform.


## Security Notes

- Never commit private keys or secrets to the repository
- Use environment variables for sensitive configuration
- Always verify contract addresses before interacting


## License

MIT — see the repository’s root `LICENSE` file.

