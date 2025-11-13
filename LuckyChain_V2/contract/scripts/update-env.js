#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const NETWORK_CHAIN_IDS = {
  localhost: "31337",
  hardhat: "31337",
  sepolia: "11155111",
};

function getArg(flag, defaultValue) {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv.length > index + 1) {
    return process.argv[index + 1];
  }
  return defaultValue;
}

function findJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findJsonFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      return [fullPath];
    }
    return [];
  });
}

function extractAddressFromFile(filePath, moduleName) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    if (typeof data === "string" && data.startsWith("0x")) {
      return data;
    }

    if (data && typeof data === "object") {
      const exactKey = `${moduleName}#Raffle`;
      if (data[exactKey]) {
        return data[exactKey];
      }

      const entry = Object.entries(data).find(([key]) =>
        key.startsWith(`${moduleName}#`),
      );
      if (entry) {
        return entry[1];
      }

      if (data.address && typeof data.address === "string") {
        return data.address;
      }
    }
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error.message);
  }

  return undefined;
}

function updateEnvFile(envPath, address) {
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  const key = "NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS";
  const newLine = `${key}=${address}`;
  const existingIndex = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (existingIndex >= 0) {
    lines[existingIndex] = newLine;
  } else {
    lines.push(newLine);
  }

  fs.writeFileSync(envPath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const moduleName = getArg("--module", "RaffleModule");
  const network = getArg("--network", "sepolia");
  const chainIdArg = getArg("--chain-id", NETWORK_CHAIN_IDS[network] || network);
  const chainId = String(chainIdArg);

  if (!chainId || !chainId.match(/^\d+$/)) {
    console.error(
      `Unable to determine chain id. Pass --chain-id or use --network with one of: ${Object.keys(
        NETWORK_CHAIN_IDS,
      ).join(", ")}`,
    );
    process.exit(1);
  }

  const deploymentsRoot = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
  );
  const chainDir = path.join(deploymentsRoot, `chain-${chainId}`);

  if (!fs.existsSync(chainDir)) {
    console.error(`No Ignition deployments found for chain ${chainId}.`);
    process.exit(1);
  }

  const jsonFiles = findJsonFiles(chainDir);
  if (jsonFiles.length === 0) {
    console.error(`No deployment JSON files found in ${chainDir}.`);
    process.exit(1);
  }

  jsonFiles.sort((a, b) => {
    const statA = fs.statSync(a);
    const statB = fs.statSync(b);
    return statB.mtimeMs - statA.mtimeMs;
  });

  let address;
  for (const file of jsonFiles) {
    address = extractAddressFromFile(file, moduleName);
    if (address) {
      console.log(`Found address ${address} in ${file}`);
      break;
    }
  }

  if (!address) {
    console.error(
      `Unable to find address for module ${moduleName} in chain ${chainId}.`,
    );
    process.exit(1);
  }

  const envPath = path.join(__dirname, "..", "..", ".env.local");
  updateEnvFile(envPath, address);
  console.log(`Updated ${envPath} with contract address ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

