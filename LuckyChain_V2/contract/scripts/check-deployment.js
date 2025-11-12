#!/usr/bin/env node

/**
 * Check deployment status and health of deployed contract
 * Usage: node scripts/check-deployment.js --network sepolia
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.findIndex(arg => arg === '--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'sepolia';

async function main() {
  console.log(`🔍 Checking deployment status on ${network}...\n`);

  try {
    // Get deployed address from Ignition
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
      console.log('⚠️  No deployment found for this network.');
      console.log(`   Run: npx hardhat ignition deploy LotteryModule --network ${network}`);
      return;
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
      console.log('⚠️  No deployment files found.');
      return;
    }

    jsonFiles.sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statB.mtimeMs - statA.mtimeMs;
    });

    // Extract address from the latest deployment file
    let contractAddress;
    for (const file of jsonFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const moduleAddress = data['LotteryModule#Lottery'];
        if (moduleAddress) {
          contractAddress = moduleAddress;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!contractAddress) {
      console.log('⚠️  Contract address not found in deployment files.');
      return;
    }

    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: ${network} (Chain ID: ${chainId})\n`);

    // Connect to contract
    const Lottery = await ethers.getContractFactory('Lottery');
    const lottery = Lottery.attach(contractAddress);

    // Check contract state
    console.log('📊 Contract State:');
    try {
      const nextLotteryId = await lottery.nextLotteryId();
      console.log(`   Next Lottery ID: ${nextLotteryId.toString()}`);
      console.log(`   Max Creator %: ${(await lottery.MAX_CREATOR_PCT()).toString()}%`);
      
      // Try to get lottery count (if any exist)
      if (nextLotteryId > 0n) {
        console.log(`\n   📋 Found ${nextLotteryId.toString()} lottery(ies) on contract`);
      } else {
        console.log(`\n   📋 No lotteries created yet`);
      }

      console.log('\n✅ Contract is deployed and responding correctly!');
    } catch (error) {
      console.log(`\n⚠️  Could not read contract state: ${error.message}`);
      console.log('   Contract may be deployed but not verified, or network connection issue.');
    }

  } catch (error) {
    console.error('❌ Error checking deployment:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

