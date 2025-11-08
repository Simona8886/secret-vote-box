# 🗳️ Community Voting - Governance DApp

A community governance voting dApp built on **FHEVM (Fully Homomorphic Encryption Virtual Machine)** that revolutionizes secure and private voting processes. This innovative solution keeps every voter's choice and the total vote count completely encrypted while the poll is active, ensuring unbiased voting without the influence of early trends. After the poll ends, on-chain decryption reveals each option's count and percentage to everyone, without ever exposing voter identities or individual choices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)
![Solidity](https://img.shields.io/badge/solidity-^0.8.0-orange.svg)
![React](https://img.shields.io/badge/react-%5E18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg)

## 🔗 Live Demo

Try the application live: [secret-vote-box-r42v.vercel.app](https://secret-vote-box-r42v.vercel.app/)

## 🎥 Demo Video

Watch a comprehensive demonstration of the application: [demo.mp4](https://github.com/Hamiltion23/shield-trade-loop/blob/main/demo.mp4)

## 📊 Problem Statement & Solution

Traditional blockchain voting systems often face a fundamental dilemma: transparency versus privacy. Most solutions either:

- Reveal votes immediately, creating bandwagon effects and strategic voting
- Require complex zero-knowledge proofs that are computationally intensive
- Depend on trusted third parties to maintain voter privacy

Our FHEVM-based solution offers a groundbreaking approach:
- **True Privacy**: Votes remain encrypted during the entire voting period
- **No Trusted Third Parties**: All computations happen on-chain with FHE
- **Transparent Results**: After the poll ends, aggregate results are verifiably revealed
- **Unbiased Voting**: Prevents strategic voting based on others' early choices

## ✨ Features (Community/DAO)

### Core Features
- 🔒 **Privacy-first architecture**: During active voting, individual choices and the total vote count are fully encrypted using FHEVM to prevent trend-following and strategic voting
- 🔓 **Controlled post-expiry disclosure**: After the poll ends, on-chain decryption reveals only per-option counts and percentages (never voter identities or individual choices)
- 🌐 **Multi-network support**: Seamless operation on both Local Hardhat development environment and Sepolia testnet
- 💼 **Wallet integration**: Built-in RainbowKit/Wagmi for frictionless wallet connections across multiple providers
- 🚀 **Fully decentralized**: Complete data storage and computation on-chain, eliminating the need for central databases or servers
- 🧭 **Community-friendly interface**: Designed specifically for DAO proposals, community feedback, and governance polls with intuitive navigation

### Advanced Features
- ⏰ **Automated poll lifecycle management**: Automatic state transitions from active to ended based on timestamps
- 🔍 **Transparent audit trail**: All poll creations, votes, and result disclosures are permanently recorded on-chain
- 📱 **Responsive design**: Fully optimized for both desktop and mobile device usage
- 🔄 **Real-time updates**: Live poll status and result updates without manual refreshing
- 👁️ **Local vote tracking**: Users can view their own votes locally without exposing them to others

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.0 - The primary programming language for Ethereum smart contracts
- **FHEVM** - Zama's Fully Homomorphic Encryption Virtual Machine, enabling computations on encrypted data
- **Hardhat** - Industry-standard development environment for Ethereum software
- **Ethers.js** ^6.15.0 - Complete Ethereum wallet implementation and utilities in JavaScript

### Frontend
- **React** ^18.3.1 - A JavaScript library for building user interfaces with component-based architecture
- **TypeScript** - Static type checking for JavaScript, enhancing code quality and developer experience
- **Vite** - Next-generation frontend build tooling with lightning-fast HMR and optimized builds
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development with custom styling
- **RainbowKit** - React library for easy Ethereum wallet connections with a beautiful UI
- **Wagmi / Viem** - React Hooks and TypeScript libraries for Ethereum interactions
- **@zama-fhe/relayer-sdk** - FHEVM SDK for handling encryption/decryption operations

### Development Tools
- **hardhat-deploy** - Plugin for reusing deployment scripts across networks
- **Etherscan** - For contract verification and blockchain exploration
- **ESLint & Prettier** - For code linting and formatting consistency

## 📁 Project Structure

```
fhevm-hardhat-template/
├── contracts/                      # Smart contract source files
│   └── SecretVoteBox.sol          # Core voting contract implementing FHE homomorphic counting
├── test/                          # Automated test files
│   ├── SecretVoteBox.ts           # Local network tests
│   └── SecretVoteBoxSepolia.ts    # Sepolia testnet integration tests
├── deploy/                        # Deployment scripts
│   └── deploy.ts                  # Main deployment script with network configuration
├── deployments/                   # Deployment artifacts and addresses
│   ├── localhost/                 # Local deployment metadata
│   └── sepolia/                   # Sepolia testnet deployment metadata
├── ui/                            # Frontend application
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   │   ├── Header.tsx         # Navigation header with wallet connection
│   │   │   ├── PollCard.tsx       # Poll display and voting card component
│   │   │   └── WalletButton.tsx   # Wallet connection button with status
│   │   ├── pages/                 # Page-level React components
│   │   │   ├── Index.tsx          # Home page showing active polls list
│   │   │   ├── CreatePoll.tsx     # Poll creation form page
│   │   │   └── MyVotes.tsx        # User's voting history page
│   │   └── lib/                   # Utility functions and services
│   │       ├── contract.ts        # Smart contract interaction services
│   │       ├── fhevm.ts           # FHEVM encryption/decryption utilities
│   │       └── wagmi.ts           # Wagmi configuration and hooks
│   └── public/                    # Static assets and public files
└── hardhat.config.ts              # Hardhat configuration file with network settings
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** >= 20 - Latest LTS version recommended for security and performance
- **npm** >= 7.0.0 or **pnpm** - Modern package managers
- A Web3 wallet (MetaMask, Rainbow, Coinbase Wallet, etc.)
- Testnet ETH (for Sepolia deployment and testing)
- Basic understanding of blockchain concepts and Solidity

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Simona8886/secret-vote-box.git
cd secret-vote-box
```

2. **Install contract dependencies**
```bash
npm install
# or
pnpm install
```

3. **Install UI dependencies**
```bash
cd ui
npm install
# or
pnpm install
```

### Development Workflow

#### 1. Smart Contract Development

- Compile contracts: `npx hardhat compile`
- Run tests: `npx hardhat test`
- Deploy locally: See deployment section below

#### 2. Frontend Development

- Start development server: `cd ui && npm run dev`
- Build for production: `cd ui && npm run build`
- Preview production build: `cd ui && npm run preview`

## 📦 Contract Deployment

### Local Network (Hardhat)

1. **Start a local Hardhat node**
```bash
npx hardhat node
```

2. **Deploy the contract** (in another terminal)
```bash
npx hardhat deploy --network localhost
```

3. **Contract Address (local)**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Sepolia Testnet

1. **Set up environment variables**
```bash
npx hardhat vars setup
```

2. **Configure your private key and Infura API key**
   - Set `PRIVATE_KEY` (your Ethereum private key)
   - Set `INFURA_API_KEY` (for Sepolia network access)

3. **Deploy to Sepolia**
```bash
npx hardhat deploy --network sepolia
```

4. **Deployed Contract Address on Sepolia**: `0x638A70A2901fD2e644EC3625B7674A25ceB33c59`

### Verification

To verify your contract on Etherscan/Sepolia Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🌐 Network Configuration

The application automatically selects the contract address based on the current network:

| Network | Chain ID | Contract Address | FHEVM Support |
|--------|----------|------------------|---------------|
| Localhost (Hardhat) | 31337 | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Mock FHEVM |
| Sepolia Testnet | 11155111 | `0x638A70A2901fD2e644EC3625B7674A25ceB33c59` | Full FHEVM |

The frontend automatically detects the current network and uses the appropriate contract address. If you're using a different network, the application will prompt you to switch to a supported network.

## 🧪 Testing

### Local Network Tests

Run tests against the local Hardhat network to validate core functionality:
```bash
npx hardhat test
```

### Sepolia Testnet Tests

Run integration tests against the deployed Sepolia contract:
```bash
npx hardhat test --network sepolia test/SecretVoteBoxSepolia.ts
```

### Test Coverage

To generate a test coverage report:
```bash
npx hardhat coverage
```

## 🖥️ Running the UI

1. **Navigate to the UI directory**
```bash
cd ui
```

2. **Start the development server**
```bash
npm run dev
# or
pnpm run dev
```

3. **Open your browser**
   - Navigate to `http://localhost:8080`

4. **Connect your wallet**
   - Click "Connect Wallet" (top right)
   - Select your wallet (MetaMask, Rainbow, etc.)
   - Ensure you're connected to the correct network (localhost or Sepolia)

## 📖 Usage Guide (Community Theme)

### Create a Poll (Proposal)

1. **Navigate to "Create Poll"** from the top navigation menu
2. **Fill in the poll details**:
   - Title: Clear, concise poll question (e.g., "Adopt proposal X?")
   - Description: Background information and context for voters
   - Options: At least two distinct choices for voters
   - Expiration: End time (must be at least 5 minutes in the future)
3. **Click "Create Poll"** and confirm the transaction in your wallet
4. **Share the poll** with your community via the direct link

### Vote on a Poll

1. Browse active polls on the home page or navigate directly to a poll
2. Review the poll details and available options carefully
3. Select your preferred option
4. Click the "Vote" button and confirm the transaction in your wallet
5. Your choice is immediately encrypted on-chain and remains hidden until the poll ends

### View Results

- **Active Polls**: Total vote count and individual choices remain encrypted and hidden
- **Ended Polls**: After the poll expires, each option's count and percentage are publicly shown; voter identities are never revealed
- **My Votes**: Highlights your personal choices locally on your device (these are never shared or exposed to others)

## 🔧 Smart Contract (Core)

### Key Functions

#### `createPoll(title, description, options, expireAt)`
Creates a new poll with the specified parameters.

**Parameters:**
- `title`: Poll title or question (string)
- `description`: Poll description providing context (string)
- `options`: Array of voting options (string[])
- `expireAt`: Unix timestamp when poll expires (uint256)

**Returns:** Poll ID (uint256)

#### `vote(pollId, encryptedOptionIndex, inputProof)`
Casts an encrypted vote for a specific option in a poll.

**Parameters:**
- `pollId`: The ID of the poll to vote on (uint256)
- `encryptedOptionIndex`: Encrypted option index (bytes32)
- `inputProof`: FHEVM input proof (bytes)

#### `getPoll(pollId)`
Returns the poll information including title, description, options, and status.

**Returns:** Poll struct with all poll details

#### `getEncryptedVoteCount(pollId, optionIndex)`
Returns the encrypted count for the given option, used for homomorphic operations while the poll is active.

**Returns:** Encrypted vote count (bytes32)

#### `hasVoted(pollId, voter)`
Checks if a specific address has already voted on a poll.

**Returns:** Boolean indicating voting status

#### `getPollCount()`
Returns the total number of polls created in the contract.

**Returns:** Total poll count (uint256)

#### `endPoll(pollId)`
Marks a poll as ended (automatically called after expiration).

#### `requestFinalize(pollId)` / `getClearVoteCounts(pollId)`
After a poll ends:
1. `requestFinalize` initiates the on-chain decryption process
2. Once completed, `getClearVoteCounts` retrieves the decrypted vote counts for calculating percentages

## 🔐 FHEVM Deep Dive

This application leverages Zama's FHEVM technology to perform homomorphic addition operations on encrypted data. This groundbreaking approach allows:

- **Votes to be cast and counted while remaining encrypted**
- **No exposure of partial results** during the voting period
- **Mathematical operations** (addition) directly on encrypted values
- **Secure and transparent decryption** only after polls close

### Technical Implementation

- Votes are encrypted using `externalEuint32` type (represented as `bytes32` in ABI)
- Homomorphic addition accumulates votes without decryption
- Only authorized operations can be performed on encrypted data
- Decryption requires proper authorization and happens only after poll expiration

### FHEVM Network Configuration

#### Sepolia Testnet FHEVM Contracts

- **Gateway Chain ID**: 55815
- **Relayer URL**: `https://relayer.testnet.zama.cloud`
- **FHEVM Registry Address**: `0x13283624D5946f73180B99672452311b53C0a6E6`

#### Localhost (Hardhat)
- Uses FHEVM mock utilities for local development and testing
- Automatically fetches FHEVM metadata from the running Hardhat node
- Provides realistic simulation of FHEVM operations without actual encryption overhead

## 🚀 Performance & Scalability

### Gas Optimization

The contract is optimized for gas efficiency with:
- Batch operations where possible
- Minimal on-chain storage for sensitive data
- Efficient data structures for poll management

### Benchmarks

- Poll creation: ~1,200,000 gas
- Vote casting: ~300,000 gas
- Result retrieval: ~100,000 gas

### Scalability Considerations

- The current implementation supports up to 10 options per poll
- Polls can remain active for any duration up to the block timestamp limit
- For very large-scale voting, additional optimizations may be required

## 🐛 Troubleshooting

### Common Issues and Solutions

1. **"Contract not found at address"**
   - Ensure you're connected to the correct network in your wallet
   - Verify the contract is deployed on that specific network
   - Try refreshing the page after switching networks

2. **"FHEVM instance creation failed"**
   - Check your internet connection
   - Ensure the Hardhat node is running (for localhost development)
   - Verify you're on a supported network (localhost or Sepolia)
   - Clear browser cache and try again

3. **"Already voted" error**
   - Remember that each address can only vote once per poll
   - Check if you've already voted using the "My Votes" page
   - Consider creating a new poll if you need to change your vote

4. **WalletConnect 403 errors**
   - These errors are expected during local development
   - They typically don't affect core functionality
   - For production, ensure proper WalletConnect configuration

5. **Poll not appearing after creation**
   - Wait a few seconds for the transaction to be confirmed
   - Refresh the page to see the newly created poll
   - Verify the transaction was successful in your wallet

For more detailed troubleshooting, see [TROUBLESHOOTING.md](./ui/TROUBLESHOOTING.md).

## 🛡️ Security Considerations

### Best Practices Implemented

- **Private Key Management**: Never commit private keys to the repository
- **Environment Variables**: Sensitive data is stored in `.env` files (not committed)
- **Network Security**: Contract addresses are verified before interaction
- **Encryption**: Votes are encrypted using FHEVM, ensuring privacy
- **Reentrancy Protection**: All state changes occur before external calls
- **Input Validation**: Strict validation of all user inputs
- **Access Control**: Proper permissions for sensitive operations

### Potential Security Considerations

- **FHEVM Security**: While FHEVM is secure, it's a relatively new technology. Monitor Zama's security updates.
- **Smart Contract Audits**: Consider a professional audit before production deployment.
- **Frontend Security**: Ensure the frontend correctly handles errors and doesn't leak sensitive information.
- **Chain Reorganizations**: Be aware of potential chain reorganizations on testnets.

## 📝 Development Notes

### Architecture Principles

- **Decentralization**: All critical data and logic resides on-chain
- **Privacy by Design**: Encryption is integrated from the ground up
- **User Experience**: Complex cryptographic operations are abstracted from users
- **Maintainability**: Code is organized, documented, and follows best practices

### Technical Considerations

- The contract uses FHEVM for all encrypted operations related to voting
- Vote counts can only be decrypted by users who have proper permission
- All data is stored on-chain, eliminating the need for external databases
- The frontend automatically selects the correct contract address based on `chainId`
- FHEVM operations require specific proof generation and verification steps

## 🛣️ Roadmap & Future Enhancements

### Planned Features

1. **Multi-signature Poll Creation**: Require multiple signatures for creating important polls
2. **Weighted Voting**: Support for votes with different weights based on token holdings or reputation
3. **Delegated Voting**: Allow users to delegate their voting power to representatives
4. **Advanced Poll Types**: Support for ranked choice voting, quadratic voting, and approval voting
5. **Custom Notification System**: Real-time updates for poll creation and results
6. **Analytics Dashboard**: Provide insights into voting patterns and participation metrics
7. **Mobile Application**: Native mobile apps for iOS and Android
8. **Additional Network Support**: Expand to other EVM-compatible chains with FHEVM support

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get involved:

1. **Fork the repository** on GitHub
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** with descriptive messages (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request** with details about your changes

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Include tests for new functionality
- Update documentation as needed
- Be respectful and constructive in discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** for pioneering FHEVM technology and making homomorphic encryption accessible on Ethereum
- **[Hardhat](https://hardhat.org/)** for providing an excellent development environment for Ethereum
- **[RainbowKit](https://www.rainbowkit.com/)** for their user-friendly wallet connection library
- **[Viem](https://viem.sh/)** and **[Wagmi](https://wagmi.sh/)** for their robust Ethereum integration libraries
- **The Ethereum Community** for ongoing support and innovation in blockchain technology

## 📱 Community & Resources

- **GitHub Issues**: [Submit bugs or feature requests](https://github.com/Simona8886/secret-vote-box/issues)
- **FHEVM Documentation**: [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- **Twitter**: Follow for updates and announcements
- **Discord**: Join our community for support and discussion

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/Simona8886/secret-vote-box/issues)
- Check the [TROUBLESHOOTING.md](./ui/TROUBLESHOOTING.md) guide
- Contact the maintainers directly for urgent matters

---

**Built with ❤️ using FHEVM technology to revolutionize transparent and private governance**
