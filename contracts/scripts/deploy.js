const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const districtOfficer = signers[1] || deployer;
  const departmentHead = signers[2] || deployer;

  const FundTracking = await hre.ethers.getContractFactory("FundTracking");
  const contract = await FundTracking.deploy();
  await contract.deployed();

  console.log(`FundTracking deployed to: ${contract.address}`);
  console.log(`Deployer wallet: ${deployer.address}`);
  
  if (signers.length >= 3) {
    await (await contract.assignRole(deployer.address, 1)).wait();
    await (await contract.assignRole(districtOfficer.address, 2)).wait();
    await (await contract.assignRole(departmentHead.address, 3)).wait();
    console.log("Roles assigned to distinct signers.");
  } else {
    console.log("Single signer detected. Roles can be assigned later via the Dashboard.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
