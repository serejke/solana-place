import { BoardService } from "../../../service/BoardService";
import { BoardState } from "../../../model/boardState";
import { Game } from "../types/typechain-types";
import { ethers } from "ethers";
import { parseColors } from "../../utils";

export class EthereumBoardService implements BoardService {
  constructor(private game: Game) {}

  async getBoardState(): Promise<BoardState> {
    const state = await this.game.state();
    const width = await this.game.width();
    const height = await this.game.height();
    const colorsHex = await this.game.colors();
    const changeCost = await this.game.changeCost();
    const allColors = ethers.utils.arrayify(colorsHex);
    const colors = parseColors(height, width, allColors);
    return {
      state: state.toNumber(),
      width,
      height,
      changeCost: changeCost.toNumber(),
      colors,
    };
  }
}
