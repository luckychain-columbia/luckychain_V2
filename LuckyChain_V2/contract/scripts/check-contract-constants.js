#!/usr/bin/env node

/**
 * Check what constants are actually deployed in the contract
 */

const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  console.log(`🔍 Checking contract constants at ${contractAddress}...\n`);
  
  try {
    const Raffle = await ethers.getContractFactory('Raffle');
    const raffle = Raffle.attach(contractAddress);
    
    console.log('📊 Contract Constants:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const minReward = await raffle.MIN_FINALIZATION_REWARD();
    const maxReward = await raffle.MAX_FINALIZATION_REWARD();
    const bps = await raffle.FINALIZATION_REWARD_BPS();
    
    console.log(`MIN_FINALIZATION_REWARD: ${ethers.formatEther(minReward)} ETH`);
    console.log(`MAX_FINALIZATION_REWARD: ${ethers.formatEther(maxReward)} ETH`);
    console.log(`FINALIZATION_REWARD_BPS: ${bps.toString()} (${Number(bps) / 100}%)`);
    
    console.log('\n📋 Expected Values:');
    console.log('MIN_FINALIZATION_REWARD: 0.005 ETH');
    console.log('MAX_FINALIZATION_REWARD: 0.01 ETH');
    console.log('FINALIZATION_REWARD_BPS: 10 (0.1%)');
    
    console.log('\n✅ Status:');
    if (minReward === ethers.parseEther('0.005')) {
      console.log('✅ MIN_FINALIZATION_REWARD is correct (0.005 ETH)');
    } else {
      console.log(`❌ MIN_FINALIZATION_REWARD mismatch! Expected 0.005 ETH, got ${ethers.formatEther(minReward)} ETH`);
      console.log('   → Contract needs to be redeployed!');
    }
    
    if (bps === 10n) {
      console.log('✅ FINALIZATION_REWARD_BPS is correct (0.1%)');
    } else {
      console.log(`❌ FINALIZATION_REWARD_BPS mismatch! Expected 10, got ${bps.toString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  This might mean:');
    console.log('   - Contract is not deployed at this address');
    console.log('   - Hardhat node is not running');
    console.log('   - Contract bytecode is missing from Hardhat');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
