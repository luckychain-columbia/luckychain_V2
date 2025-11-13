#!/usr/bin/env node

/**
 * Verify a deployed contract on Etherscan
 * Usage: node scripts/verify-deployment.js --network sepolia --address 0x...
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.findIndex(arg => arg === '--network');
const addressIndex = args.findIndex(arg => arg === '--address');

const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'sepolia';
let address = addressIndex !== -1 && args[addressIndex + 1] ? args[addressIndex + 1] : null;

if (!address) {
  // Try to get address from latest Ignition deployment
  try {
    const NETWORK_CHAIN_IDS = {
      localhost: '31337',
      hardhat: '31337',
      sepolia: '11155111',
      mainnet: '1'
    };
    const chainId = NETWORK_CHAIN_IDS[network] || '11155111';
    const deploymentsRoot = path.join(__dirname, '../ignition/deployments');
    const chainDir = path.join(deploymentsRoot, `chain-${chainId}`);
    
    if (!fs.existsSync(chainDir)) {
      console.error('❌ No deployment found. Please provide --address or deploy first.');
      process.exit(1);
    }

    // Find JSON files and get the latest one
    function findJsonFiles(dir) {
      if (!fs.existsSync(dir)) return [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return findJsonFiles(fullPath);
        }
        if (entry.isFile() && entry.name.endsWith('.json')) {
          return [fullPath];
        }
        return [];
      });
    }

    const jsonFiles = findJsonFiles(chainDir);
    if (jsonFiles.length === 0) {
      console.error('❌ No deployment files found. Please provide --address or deploy first.');
      process.exit(1);
    }

    jsonFiles.sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statB.mtimeMs - statA.mtimeMs;
    });

    // Extract address from the latest deployment file
    for (const file of jsonFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const moduleAddress = data['RaffleModule#Raffle'];
        if (moduleAddress) {
          address = moduleAddress;
          console.log(`📍 Found deployed address from Ignition: ${address}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!address) {
      console.error('❌ Contract address not found in deployment files. Please provide --address.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to read deployment address:', error.message);
    process.exit(1);
  }
}

console.log(`🔍 Verifying contract at ${address} on ${network}...\n`);

try {
  execSync(`npx hardhat verify --network ${network} ${address}`, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  console.log('\n✅ Contract verified on Etherscan!');
} catch (error) {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
}

