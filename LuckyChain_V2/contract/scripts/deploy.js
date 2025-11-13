const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  const Raffle = await hre.ethers.getContractFactory("Raffle");
  const raffle = await Raffle.deploy();
  await raffle.waitForDeployment();

  console.log(`Raffle contract deployed at: ${raffle.target}`);

  if (hre.network.name === "localhost") {
    console.log("\nSample usage:");
    console.log(
      "npx hardhat console --network localhost\n> const raffle = await ethers.getContractAt('Raffle', '%s')",
      raffle.target,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

