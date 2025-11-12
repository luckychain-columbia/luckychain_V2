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

### Localhost

Start the Hardhat node in a separate terminal (`npx hardhat node`), then:

```bash
npm run deploy:local
```

### Sepolia (or other networks)

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

The script will print the deployed contract address.

After deploying with Hardhat Ignition, you can sync the frontend `.env.local` automatically:

```bash
npm run env:sync -- --network sepolia
```

This reads the latest Ignition deployment, finds `LotteryModule`, and writes the address to `../.env.local` as `NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS`.

## Tests

Add tests inside the `test/` folder and run them with:

```bash
npm test
```

