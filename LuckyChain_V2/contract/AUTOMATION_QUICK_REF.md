# Automation Quick Reference

## 🚀 Common Workflows

### Deploy to Testnet
```bash
npm run deploy -- --network sepolia
```

### Full Deployment Pipeline
```bash
npm run full:deploy -- --network sepolia
```

### Check Deployment Status
```bash
npm run check -- --network sepolia
```

### Verify on Etherscan
```bash
npm run verify -- --network sepolia
```

### Pre-Deployment Validation
```bash
npm run pre-check -- --network sepolia
```

## 📋 All Available Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts (auto-exports ABI) |
| `npm run deploy` | Deploy and sync to frontend |
| `npm run export:abi` | Export ABI to frontend |
| `npm run verify` | Verify contract on Etherscan |
| `npm run check` | Check deployment health |
| `npm run pre-check` | Pre-deployment validation |
| `npm run full:deploy` | Complete deployment pipeline |

## 🔄 Automation Flow

```
Compile → Export ABI → Deploy → Sync to Frontend → Verify → Check Health
```

## 📝 What Gets Automated

1. **ABI Export** - Automatically exports after compilation
2. **Address Sync** - Automatically updates frontend `.env.local`
3. **Deployment Detection** - Automatically finds deployed addresses
4. **Verification** - Automatically verifies on Etherscan
5. **Health Checks** - Automatically validates deployment

## 🎯 Quick Start

1. **Check prerequisites:**
   ```bash
   npm run pre-check -- --network sepolia
   ```

2. **Deploy:**
   ```bash
   npm run deploy -- --network sepolia
   ```

3. **Verify:**
   ```bash
   npm run verify -- --network sepolia
   ```

4. **Check:**
   ```bash
   npm run check -- --network sepolia
   ```

5. **Restart frontend:**
   ```bash
   cd .. && npm run dev
   ```

## 📚 Full Documentation

See `AUTOMATION.md` for detailed documentation.

