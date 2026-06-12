const {ethers} = require("hardhat");

async function main() {
  const [signer1, signer2] = await ethers.getSigners();

  const entryPoint = await ethers.deployContract("EntryPoint");
  await entryPoint.waitForDeployment();
  const entryPointAddress = await entryPoint.getAddress();
  console.log("Entrypoint address: ", entryPointAddress);
  
  const accountFactory = await ethers.deployContract("contracts/Account.sol:AccountFactory");
  await accountFactory.waitForDeployment();
  const accountFactoryAddress = await accountFactory.getAddress();
  console.log("AccountFactory address: ", accountFactoryAddress);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
