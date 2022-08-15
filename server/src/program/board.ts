// noinspection DuplicatedCode

import { BoardState } from "../model/boardState";

export function parseBoardStateFromAccount(accountState: any): BoardState {
  const colorsBuffer: Buffer = accountState.colors;
  const state = accountState.state;
  const height = accountState.height;
  const width = accountState.width;
  const colors: number[][] = new Array(height).fill(0).map(() => new Array(width).fill(0));
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      colors[row][column] = colorsBuffer.readUint8(row * width + column);
    }
  }
  return {
    state,
    height,
    width,
    colors
  };
}
