import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Game", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Game = await ethers.getContractFactory("Game");
    const game = await Game.deploy(2, 2, 2);

    return { game, owner, otherAccount };
  }

  it("changePixel", async function () {
    const { game } = await loadFixture(deployContract);

    await expect(game.changePixel(0, 0, 1))
      .to.emit(game, "PixelChangedEvent")
      .withArgs(0, 0, 1);

    const colors = await game.colors();
    console.log(colors);
  });
});
