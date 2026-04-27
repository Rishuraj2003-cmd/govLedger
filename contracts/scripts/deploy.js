const hre = require("hardhat");

async function main() {
  const [deployer, districtOfficer, departmentHead] = await hre.ethers.getSigners();
  const FundTracking = await hre.ethers.getContractFactory("FundTracking");
  const contract = await FundTracking.deploy();
  await contract.deployed();

  await (await contract.assignRole(deployer.address, 1)).wait();
  await (await contract.assignRole(districtOfficer.address, 2)).wait();
  await (await contract.assignRole(departmentHead.address, 3)).wait();

  console.log(`FundTracking deployed to: ${contract.address}`);
  console.log(`Admin wallet: ${deployer.address}`);
  console.log(`District wallet: ${districtOfficer.address}`);
  console.log(`Department wallet: ${departmentHead.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
