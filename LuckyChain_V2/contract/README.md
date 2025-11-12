# LuckyChain Hardhat Project

This directory contains the Hardhat workspace for the LuckyChain smart contracts.

## Prerequisites

- Node.js 18+
- npm

## Install dependencies

```bash
cd contract
npm install
```

## Compile the contracts

```bash
npm run compile
```

## Run a local node

```bash
npx hardhat node
```

## Deploy

### Quick Deploy (Recommended)

The easiest way to deploy is using the automated deployment script:

```bash
# Deploy to Sepolia testnet (auto-syncs to frontend)
npm run deploy -- --network sepolia

# Deploy to localhost
npm run deploy -- --network localhost
```

This automatically:
- Deploys the contract using Hardhat Ignition
- Syncs the contract address to frontend `.env.local`
- Provides instructions for next steps

### Full Deployment Pipeline

For a complete deployment including verification:

```bash
npm run full:deploy -- --network sepolia
```

This runs:
1. Compile contracts
2. Export ABI to frontend
3. Deploy contract
4. Verify on Etherscan

### Manual Deployment

#### Localhost

Start the Hardhat node in a separate terminal (`npx hardhat node`), then:

```bash
npm run deploy:local
```

#### Sepolia (or other networks)

Create a `.env` file in this directory with:

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=0xabc123...
ETHERSCAN_API_KEY=optional
```

Then run:

```bash
npm run deploy:sepolia
```

After deploying with Hardhat Ignition, you can sync the frontend `.env.local` automatically:

```bash
npm run env:sync -- --network sepolia
```

## Automation Scripts

This project includes several automation scripts to streamline the deployment process:

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run deploy` | Deploy and sync to frontend |
| `npm run export:abi` | Export ABI to frontend |
| `npm run verify` | Verify contract on Etherscan |
| `npm run check` | Check deployment health |
| `npm run pre-check` | Pre-deployment validation |
| `npm run full:deploy` | Complete deployment pipeline |

### Pre-Deployment Checks

Before deploying, validate your setup:

```bash
npm run pre-check -- --network sepolia
```

This checks:
- Contract compilation
- Environment variables
- Network configuration
- Account balance
- Frontend configuration

### Check Deployment Status

After deploying, verify the contract is working:

```bash
npm run check -- --network sepolia
```

### Verify on Etherscan

Verify your contract source code on Etherscan:

```bash
npm run verify -- --network sepolia
```

### Export ABI

Export the contract ABI to the frontend (runs automatically after compilation):

```bash
npm run export:abi
```

## Automation Documentation

For detailed documentation on all automations, see:
- **[AUTOMATION.md](./AUTOMATION.md)** - Full automation documentation
- **[AUTOMATION_QUICK_REF.md](./AUTOMATION_QUICK_REF.md)** - Quick reference guide

## Tests

Add tests inside the `test/` folder and run them with:

```bash
npm test
```

