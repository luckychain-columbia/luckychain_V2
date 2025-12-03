#!/usr/bin/env node

/**
 * Debug script to check raffle state and diagnose finalization issues
 * Usage: node scripts/debug-raffle.js <raffleId> --network localhost
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

// Find raffle ID (first argument that's not a flag)
let raffleId = 0;
for (const arg of args) {
  if (!arg.startsWith('--')) {
    const parsed = parseInt(arg, 10);
    if (!isNaN(parsed)) {
      raffleId = parsed;
      break;
    }
  }
}

const networkIndex = args.findIndex(arg => arg === '--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'localhost';

async function main() {
  console.log(`🔍 Debugging Raffle ID: ${raffleId} on ${network}...\n`);

  try {
    // Get contract address
    const NETWORK_CHAIN_IDS = {
      localhost: '31337',
      hardhat: '31337',
      sepolia: '11155111',
      mainnet: '1'
    };
    const chainId = NETWORK_CHAIN_IDS[network] || '31337';
    const deploymentsRoot = path.join(__dirname, '../ignition/deployments');
    const chainDir = path.join(deploymentsRoot, `chain-${chainId}`);
    
    let contractAddress;
    if (fs.existsSync(chainDir)) {
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
      jsonFiles.sort((a, b) => {
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statB.mtimeMs - statA.mtimeMs;
      });

      for (const file of jsonFiles) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          const moduleAddress = data['RaffleModule#Raffle'];
          if (moduleAddress) {
            contractAddress = moduleAddress;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!contractAddress) {
      // Try reading from .env.local
      const envPath = path.join(__dirname, '../../.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=(0x[a-fA-F0-9]+)/);
        if (match) {
          contractAddress = match[1];
        }
      }
    }

    if (!contractAddress) {
      console.error('❌ Contract address not found. Please deploy the contract first.');
      process.exit(1);
    }

    console.log(`📍 Contract Address: ${contractAddress}\n`);

    // Connect to contract
    const Raffle = await ethers.getContractFactory('Raffle');
    const raffle = Raffle.attach(contractAddress);

    // Check contract balance
    const provider = ethers.provider;
    const contractBalance = await provider.getBalance(contractAddress);
    console.log(`💰 Contract Balance: ${ethers.formatEther(contractBalance)} ETH\n`);

    // Validate raffle ID
    if (isNaN(raffleId)) {
      console.error('❌ Invalid raffle ID. Please provide a valid number.');
      console.log('   Usage: node scripts/debug-raffle.js <raffleId> --network localhost');
      process.exit(1);
    }

    // Get raffle info
    console.log('📋 Raffle Information:');
    try {
      const raffleInfo = await raffle.getRaffleInfo(BigInt(raffleId));
      console.log(`   Title: ${raffleInfo.title}`);
      console.log(`   Creator: ${raffleInfo.creator}`);
      console.log(`   Total Pool: ${ethers.formatEther(raffleInfo.totalPool)} ETH`);
      console.log(`   Ticket Price: ${ethers.formatEther(raffleInfo.ticketPrice)} ETH`);
      console.log(`   Max Tickets: ${raffleInfo.maxTickets.toString()}`);
      console.log(`   End Time: ${new Date(Number(raffleInfo.endTime) * 1000).toLocaleString()}`);
      console.log(`   Is Active: ${raffleInfo.isActive}`);
      console.log(`   Is Completed: ${raffleInfo.isCompleted}`);
      console.log(`   Winner: ${raffleInfo.winner || 'None'}`);

      // Get participants
      const participants = await raffle.getParticipants(BigInt(raffleId));
      console.log(`\n   Participants: ${participants.length}`);
      
      // Get raffle config
      const config = await raffle.getRaffleConfig(BigInt(raffleId));
      console.log(`   Num Winners: ${config.numWinners}`);
      console.log(`   Creator %: ${(Number(config.creatorPct) / 100).toFixed(2)}%`);

      // Check if can be finalized
      const now = Math.floor(Date.now() / 1000);
      const isExpired = Number(raffleInfo.endTime) <= now;
      const maxTicketsReached = raffleInfo.maxTickets > 0 && participants.length >= Number(raffleInfo.maxTickets);
      
      console.log(`\n🔍 Finalization Status:`);
      console.log(`   Has Ended: ${isExpired}`);
      console.log(`   Max Tickets Reached: ${maxTicketsReached}`);
      console.log(`   Can Finalize: ${!raffleInfo.isCompleted && participants.length > 0 && (isExpired || maxTicketsReached)}`);

      // Calculate expected payouts based on current contract logic
      const pool = raffleInfo.totalPool;
      const FINALIZATION_REWARD_BPS = 10n; // 0.1%
      const MIN_FINALIZATION_REWARD = ethers.parseEther("0.005"); // 0.005 ETH
      const MAX_FINALIZATION_REWARD = ethers.parseEther("0.01"); // 0.01 ETH
      
      let rewardFromPool = (pool * FINALIZATION_REWARD_BPS) / 10000n;
      let finalizationReward = rewardFromPool > MIN_FINALIZATION_REWARD
        ? (rewardFromPool > MAX_FINALIZATION_REWARD ? MAX_FINALIZATION_REWARD : rewardFromPool)
        : MIN_FINALIZATION_REWARD;
      
      if (finalizationReward > pool) {
        finalizationReward = pool;
      }
      
      const creatorReward = (pool * BigInt(config.creatorPct)) / 10000n;
      
      // Ensure rewards don't exceed pool
      let adjustedCreatorReward = creatorReward;
      let adjustedFinalizationReward = finalizationReward;
      const totalRewards = creatorReward + finalizationReward;
      if (totalRewards > pool) {
        if (pool >= finalizationReward) {
          adjustedCreatorReward = pool - finalizationReward;
        } else {
          adjustedFinalizationReward = pool;
          adjustedCreatorReward = 0n;
        }
      }
      
      const prizePool = pool - adjustedCreatorReward - adjustedFinalizationReward;

      console.log(`\n💵 Expected Payouts (based on current contract logic):`);
      console.log(`   Finalization Reward: ${ethers.formatEther(adjustedFinalizationReward)} ETH`);
      console.log(`   Creator Reward: ${ethers.formatEther(adjustedCreatorReward)} ETH`);
      console.log(`   Prize Pool: ${ethers.formatEther(prizePool)} ETH`);
      console.log(`   Total Needed: ${ethers.formatEther(adjustedFinalizationReward + adjustedCreatorReward + prizePool)} ETH`);
      console.log(`   Contract Has: ${ethers.formatEther(contractBalance)} ETH`);

      // Check balance sufficiency
      const totalPayouts = adjustedFinalizationReward + adjustedCreatorReward + prizePool;
      if (contractBalance < totalPayouts) {
        console.log(`\n⚠️  WARNING: Contract balance (${ethers.formatEther(contractBalance)} ETH) is less than total payouts (${ethers.formatEther(totalPayouts)} ETH)`);
        console.log(`   This will cause finalization to fail!`);
      } else {
        console.log(`\n✅ Contract has sufficient balance for finalization`);
      }

      // Check if raffle is already completed
      if (raffleInfo.isCompleted) {
        console.log(`\n⚠️  Raffle is already finalized!`);
        const winners = await raffle.getWinners(BigInt(raffleId));
        console.log(`   Winners: ${winners.join(', ')}`);
      }

    } catch (error) {
      console.error(`\n❌ Error reading raffle info: ${error.message}`);
      console.log(`   Raffle ID ${raffleId} may not exist or contract may have issues.`);
    }

    console.log(`\n📊 Next Raffle ID: ${(await raffle.nextRaffleId()).toString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

