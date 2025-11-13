#!/usr/bin/env node

/**
 * Deploy Raffle contract using Ignition and automatically sync the address to frontend .env
 * Usage: node scripts/deploy-and-sync.js --network sepolia
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.findIndex(arg => arg === '--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'sepolia';

console.log(`🚀 Deploying Raffle contract to ${network}...\n`);

try {
  // Step 1: Deploy using Ignition
  console.log('📦 Deploying contract with Ignition...');
  execSync(`npx hardhat ignition deploy RaffleModule --network ${network}`, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });

  // Step 2: Sync environment variable
  console.log('\n🔄 Syncing contract address to frontend .env...');
  execSync(`npm run env:sync -- --network ${network}`, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });

  console.log('\n✅ Deployment complete! Contract address synced to frontend.');
  console.log('💡 Remember to restart your Next.js dev server to pick up the new address.\n');
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}

