#!/usr/bin/env node

/**
 * Pre-deployment validation checks
 * Usage: node scripts/pre-deploy-check.js --network sepolia
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.findIndex(arg => arg === '--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'sepolia';

const NETWORK_CHAIN_IDS = {
  localhost: '31337',
  hardhat: '31337',
  sepolia: '11155111',
  mainnet: '1'
};

const REQUIRED_ENV_VARS = {
  sepolia: ['PRIVATE_KEY', 'SEPOLIA_RPC_URL'],
  mainnet: ['PRIVATE_KEY', 'MAINNET_RPC_URL'],
  localhost: []
};

let hasErrors = false;
let hasWarnings = false;

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

function warning(message) {
  console.warn(`⚠️  ${message}`);
  hasWarnings = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

async function main() {
  console.log(`🔍 Running pre-deployment checks for ${network}...\n`);

  // Check 1: Contract compilation
  console.log('1️⃣  Checking contract compilation...');
  const artifactsPath = path.join(__dirname, '../artifacts/contracts/Raffle.sol/Raffle.json');
  if (fs.existsSync(artifactsPath)) {
    success('Contract artifacts found');
  } else {
    error('Contract not compiled. Run: npm run compile');
  }

  // Check 2: Environment variables
  console.log('\n2️⃣  Checking environment variables...');
  const required = REQUIRED_ENV_VARS[network] || [];
  for (const envVar of required) {
    if (process.env[envVar]) {
      success(`${envVar} is set`);
    } else {
      error(`${envVar} is not set. Add it to .env file`);
    }
  }

  // Check 3: Network configuration
  console.log('\n3️⃣  Checking network configuration...');
  const chainId = NETWORK_CHAIN_IDS[network];
  if (chainId) {
    success(`Network ${network} has chain ID ${chainId}`);
  } else {
    warning(`Unknown network: ${network}. Chain ID may be incorrect.`);
  }

  // Check 4: Account balance (for testnets/mainnet)
  if (network !== 'localhost' && network !== 'hardhat') {
    console.log('\n4️⃣  Checking account balance...');
    try {
      const { ethers } = require('hardhat');
      const provider = await ethers.provider;
      const signers = await ethers.getSigners();
      if (signers.length > 0) {
        const balance = await provider.getBalance(signers[0].address);
        const balanceEth = ethers.formatEther(balance);
        if (parseFloat(balanceEth) > 0.01) {
          success(`Account has ${balanceEth} ETH`);
        } else {
          warning(`Account balance is low: ${balanceEth} ETH. You may not have enough for deployment.`);
        }
      }
    } catch (e) {
      warning(`Could not check account balance: ${e.message}`);
    }
  }

  // Check 5: Frontend .env file
  console.log('\n5️⃣  Checking frontend configuration...');
  const frontendEnvPath = path.join(__dirname, '../../.env.local');
  if (fs.existsSync(frontendEnvPath)) {
    success('Frontend .env.local file exists');
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    if (envContent.includes('NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS')) {
      success('Contract address variable is set in frontend .env');
    } else {
      warning('Contract address variable not found in frontend .env (will be created after deployment)');
    }
  } else {
    warning('Frontend .env.local file not found (will be created after deployment)');
  }

  // Check 6: Ignition module exists
  console.log('\n6️⃣  Checking Ignition module...');
  const modulePath = path.join(__dirname, '../ignition/modules/RaffleModule.js');
  if (fs.existsSync(modulePath)) {
    success('Ignition module found');
  } else {
    error('Ignition module not found. Run: npx hardhat ignition init');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('\n❌ Pre-deployment checks failed. Please fix the errors above.');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('\n⚠️  Pre-deployment checks completed with warnings. Review above.');
    process.exit(0);
  } else {
    console.log('\n✅ All pre-deployment checks passed! Ready to deploy.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Error running pre-deployment checks:', error);
  process.exit(1);
});

