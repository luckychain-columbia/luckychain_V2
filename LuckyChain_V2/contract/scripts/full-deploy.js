#!/usr/bin/env node

/**
 * Full deployment pipeline: compile -> export ABI -> deploy -> verify
 * Usage: node scripts/full-deploy.js --network sepolia
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.findIndex(arg => arg === '--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'sepolia';

console.log(`🚀 Starting full deployment pipeline for ${network}...\n`);

try {
  // Step 1: Compile
  console.log('📦 Step 1: Compiling contracts...');
  execSync('npm run compile', {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  console.log('✅ Compilation complete\n');

  // Step 2: Export ABI (runs automatically via postcompile, but explicit is better)
  console.log('📄 Step 2: Exporting ABI...');
  execSync('npm run export:abi', {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  console.log('✅ ABI exported\n');

  // Step 3: Deploy and sync
  console.log('🚀 Step 3: Deploying contract...');
  execSync(`npm run deploy -- --network ${network}`, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  console.log('✅ Deployment complete\n');

  // Step 4: Verify on Etherscan
  console.log('🔍 Step 4: Verifying contract on Etherscan...');
  execSync(`npm run verify -- --network ${network}`, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  console.log('✅ Verification complete\n');

  console.log('='.repeat(50));
  console.log('✅ Full deployment pipeline completed successfully!');
  console.log('💡 Remember to restart your Next.js dev server to pick up the new contract address.');
  console.log('='.repeat(50));
} catch (error) {
  console.error('\n❌ Deployment pipeline failed:', error.message);
  process.exit(1);
}

