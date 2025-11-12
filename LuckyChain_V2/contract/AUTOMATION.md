# Deployment Automations

This document describes all available automation scripts for the LuckyChain contract deployment workflow.

## Available Automations

### 1. **Deploy and Sync** (`npm run deploy`)
Deploys the contract using Ignition and automatically syncs the address to the frontend `.env.local` file.

```bash
npm run deploy -- --network sepolia
npm run deploy -- --network localhost
```

**What it does:**
- Deploys the Lottery contract using Hardhat Ignition
- Automatically extracts the deployed contract address
- Updates `../.env.local` with `NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS`
- Provides instructions to restart the Next.js dev server

**Benefits:**
- No manual copy-pasting of contract addresses
- Ensures frontend always has the latest deployment address
- Single command for deployment + configuration

---

### 2. **Export ABI** (`npm run export:abi`)
Automatically exports the contract ABI to the frontend after compilation.

```bash
npm run export:abi
```

**What it does:**
- Reads the compiled contract artifact
- Exports ABI as JSON to `../../lib/contract-abi.json`
- Exports ABI as TypeScript to `../../lib/contract-abi.ts`
- Runs automatically after `npm run compile` (via `postcompile` hook)

**Benefits:**
- Frontend always has the latest contract ABI
- Type-safe contract interactions
- No manual ABI management

**Usage in frontend:**
```typescript
import { LOTTERY_ABI } from '@/lib/contract-abi';
// Use LOTTERY_ABI with ethers.js
```

---

### 3. **Verify Deployment** (`npm run verify`)
Verifies the deployed contract on Etherscan automatically.

```bash
npm run verify -- --network sepolia
npm run verify -- --network sepolia --address 0x...
```

**What it does:**
- Automatically finds the deployed address from Ignition deployments
- Verifies the contract on Etherscan
- Can also accept a custom address via `--address` flag

**Benefits:**
- Contract source code visible on Etherscan
- Users can verify contract integrity
- Required for production deployments

**Requirements:**
- `ETHERSCAN_API_KEY` in `.env`
- Contract must be deployed first

---

### 4. **Check Deployment** (`npm run check`)
Checks the status and health of a deployed contract.

```bash
npm run check -- --network sepolia
```

**What it does:**
- Finds the deployed contract address from Ignition
- Connects to the contract on the network
- Reads contract state (lottery count, settings)
- Verifies contract is responding correctly

**Benefits:**
- Quick health check after deployment
- Verify contract is working before using in frontend
- Debug deployment issues

---

### 5. **Pre-Deployment Checks** (`npm run pre-check`)
Validates everything before deployment to catch issues early.

```bash
npm run pre-check -- --network sepolia
```

**What it does:**
- ✅ Checks if contract is compiled
- ✅ Validates required environment variables
- ✅ Verifies network configuration
- ✅ Checks account balance (for testnets/mainnet)
- ✅ Verifies frontend `.env` file exists
- ✅ Checks Ignition module exists

**Benefits:**
- Catch errors before deployment
- Save time and gas fees
- Ensure all prerequisites are met

---

### 6. **Full Deployment Pipeline** (`npm run full:deploy`)
Complete deployment pipeline from compilation to verification.

```bash
npm run full:deploy -- --network sepolia
```

**What it does:**
1. Compiles contracts
2. Exports ABI
3. Deploys contract (with sync)
4. Verifies on Etherscan

**Benefits:**
- Single command for entire deployment process
- Ensures all steps are completed
- Perfect for production deployments

---

## Post-Compile Hook

The `postcompile` script automatically runs `export:abi` after every compilation:

```json
"postcompile": "npm run export:abi"
```

This ensures the frontend always has the latest ABI whenever you compile.

---

## Workflow Examples

### Development Workflow
```bash
# 1. Make contract changes
# 2. Compile (ABI auto-exports)
npm run compile

# 3. Test locally
npm run deploy -- --network localhost

# 4. Check deployment
npm run check -- --network localhost
```

### Testnet Deployment
```bash
# 1. Pre-deployment checks
npm run pre-check -- --network sepolia

# 2. Deploy and sync
npm run deploy -- --network sepolia

# 3. Verify on Etherscan
npm run verify -- --network sepolia

# 4. Check deployment health
npm run check -- --network sepolia

# 5. Restart frontend dev server
# (in frontend directory)
npm run dev
```

### Production Deployment
```bash
# Single command for full pipeline
npm run full:deploy -- --network mainnet
```

---

## Environment Variables

Required for different networks:

### Sepolia Testnet
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Mainnet
```env
PRIVATE_KEY=your_private_key
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Localhost
```env
# No environment variables needed
# Just run: npx hardhat node
```

---

## CI/CD Integration

These automations can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Deploy Contract
  run: |
    cd contract
    npm install
    npm run compile
    npm run deploy -- --network sepolia
  env:
    PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
    SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
```

---

## Additional Automations (Future)

Potential future automations:

1. **Gas Estimation** - Estimate gas costs before deployment
2. **Deployment History** - Track all deployments with addresses and timestamps
3. **Multi-Network Deployment** - Deploy to multiple networks in one command
4. **Health Monitoring** - Continuously monitor deployed contracts
5. **Auto-Verification** - Automatically verify contracts after deployment
6. **Type Generation** - Generate TypeScript types from ABI
7. **Frontend Rebuild** - Automatically rebuild frontend after deployment
8. **Notifications** - Send Discord/Slack notifications on deployment
9. **Rollback Support** - Keep track of previous deployments for rollback
10. **Testing** - Run tests automatically before deployment

---

## Troubleshooting

### Script fails to find deployment address
- Ensure you've deployed using Ignition: `npx hardhat ignition deploy LotteryModule --network <network>`
- Check that `ignition/deployments/chain-<chainId>/` directory exists

### ABI export fails
- Run `npm run compile` first to generate artifacts
- Check that `artifacts/contracts/Lottery.sol/Lottery.json` exists

### Verification fails
- Ensure `ETHERSCAN_API_KEY` is set in `.env`
- Wait a few minutes after deployment before verifying
- Check that contract source code matches deployment

### Frontend .env not updating
- Check file permissions on `.env.local`
- Ensure the script has write access to the file
- Manually run: `npm run env:sync -- --network <network>`

---

## Script Locations

All automation scripts are in `contract/scripts/`:

- `deploy-and-sync.js` - Deploy and sync to frontend
- `export-abi.js` - Export ABI to frontend
- `verify-deployment.js` - Verify on Etherscan
- `check-deployment.js` - Check deployment health
- `pre-deploy-check.js` - Pre-deployment validation
- `update-env.js` - Sync contract address to frontend

---

## Contributing

To add new automations:

1. Create a new script in `contract/scripts/`
2. Add an npm script in `contract/package.json`
3. Update this documentation
4. Test with both localhost and testnet deployments

