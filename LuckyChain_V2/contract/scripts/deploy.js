const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.waitForDeployment();

  console.log(`Lottery contract deployed at: ${lottery.target}`);

  if (hre.network.name === "localhost") {
    console.log("\nSample usage:");
    console.log(
      "npx hardhat console --network localhost\n> const lottery = await ethers.getContractAt('Lottery', '%s')",
      lottery.target,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

