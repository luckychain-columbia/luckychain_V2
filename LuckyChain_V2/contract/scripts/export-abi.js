#!/usr/bin/env node

/**
 * Export contract ABI to frontend for type generation and contract interaction
 * Usage: node scripts/export-abi.js
 */

const fs = require('fs');
const path = require('path');

const artifactsPath = path.join(__dirname, '../artifacts/contracts/Lottery.sol/Lottery.json');
const frontendAbiPath = path.join(__dirname, '../../lib/contract-abi.json');
const frontendAbiTsPath = path.join(__dirname, '../../lib/contract-abi.ts');

try {
  // Read the compiled contract artifact
  if (!fs.existsSync(artifactsPath)) {
    console.error('❌ Contract artifacts not found. Run "npx hardhat compile" first.');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
  const abi = artifact.abi;

  // Ensure lib directory exists
  const libDir = path.dirname(frontendAbiPath);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Export as JSON
  fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
  console.log(`✅ ABI exported to ${frontendAbiPath}`);

  // Export as TypeScript for better type safety
  const abiTs = `// Auto-generated from Hardhat compilation
// Run "npm run export:abi" after compiling contracts
export const LOTTERY_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;
  fs.writeFileSync(frontendAbiTsPath, abiTs);
  console.log(`✅ ABI exported to ${frontendAbiTsPath}`);

  console.log('\n💡 Frontend can now import the ABI from "@/lib/contract-abi"');
} catch (error) {
  console.error('❌ Failed to export ABI:', error.message);
  process.exit(1);
}

