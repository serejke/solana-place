import { ethers } from "hardhat";

async function main() {
  const height = 2;
  const width = 2;
  const changeCost = 2;

  const Game = await ethers.getContractFactory("Game");
  const game = await Game.deploy(height, width, changeCost);

  await game.deployed();

  console.log(
    `Game ${height} ${width} with change cost ${changeCost} wei deployed to ${game.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
