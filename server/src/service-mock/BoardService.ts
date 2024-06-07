import { BoardState } from "../model/boardState";
import { Commitment } from "@solana/web3.js";
import { CloseableService } from "../service/CloseableService";

export class BoardServiceMock implements CloseableService {
  static create(): BoardServiceMock {
    return new BoardServiceMock();
  }

  async getBoardState(_commitment: Commitment): Promise<BoardState> {
    const colors: number[][] = [];

    const height = 500;
    const width = 800;

    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      for (let j = 0; j < width; j++) {
        row.push(Math.round(Math.random() * 16));
      }
      colors.push(row);
    }

    return {
      state: 0,
      changeCost: 100,
      colors,
      height,
      width,
    };
  }

  async close(): Promise<void> {
    return;
  }
}
