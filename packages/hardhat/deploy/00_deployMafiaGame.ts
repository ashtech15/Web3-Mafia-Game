// /**
//  * Deploys a contract named "YourContract" using the deployer account and
//  * constructor arguments set to the deployer address
//  *
//  * @param hre HardhatRuntimeEnvironment object.
//  */
// const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
//   /*
//     On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

//     When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
//     should have sufficient balance to pay for the gas fees for contract creation.

//     You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
//     with a random private key in the .env file (then used on hardhat.config.ts)
//     You can run the `yarn account` command to check your balance in every network.
//   */
//   const { deployer } = await hre.getNamedAccounts();
//   const { deploy } = hre.deployments;

//   await deploy("YourContract", {
//     from: deployer,
//     // Contract constructor arguments
//     args: [deployer],
//     log: true,
//     // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
//     // automatically mining the contract deployment transaction. There is no effect on live networks.
//     autoMine: true,
//   });

//   // Get the deployed contract to interact with it after deploying.
//   const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
//   console.log("👋 Initial greeting:", await yourContract.greeting());
// };

// export default deployYourContract;

// // Tags are useful if you have multiple deploy files and only want to run one of them.
// // e.g. yarn deploy --tags YourContract
// deployYourContract.tags = ["YourContract"];
import * as dotenv from "dotenv";
dotenv.config();
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { ethers } from "hardhat";

const deployMafiaGame: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // const { deployer } = await hre.getNamedAccounts();

  const deployerPrivateKey =
    process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const deployerWallet = new ethers.Wallet(deployerPrivateKey, hre.ethers.provider);

  const { deploy } = hre.deployments;

  const treasuryDeployment = await deploy("Treasury", {
    from: deployerWallet.address,
    log: true,
    autoMine: true,
  });

  console.log("Treasury deployed to:", treasuryDeployment.address);

  const mafiaGameDeployment = await deploy("MafiaGame", {
    from: deployerWallet.address,
    args: [treasuryDeployment.address],
    log: true,
    autoMine: true,
  });

  console.log("MafiaGame deployed to:", mafiaGameDeployment.address);
  const mafiaGame = await hre.ethers.getContract<Contract>("MafiaGame", deployerWallet.address);
  console.log("👋 MafiaGame is ready for interaction: ", await mafiaGame.getAddress());

  const treasury = await hre.ethers.getContractAt("Treasury", treasuryDeployment.address);
  await treasury.setMafiaGameAddress(mafiaGameDeployment.address);
  console.log("MafiaGame address set in Treasury:", mafiaGameDeployment.address);
};

export default deployMafiaGame;

deployMafiaGame.tags = ["MafiaGame"];
