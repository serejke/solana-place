// noinspection DuplicatedCode

import { BoardState } from "../model/boardState";

type AccountBoardState = {
  colors: unknown;
  state: number;
  height: number;
  width: number;
  changeCost: number;
};

export function parseBoardStateFromAccount(
  accountState: AccountBoardState
): BoardState {
  const allColors: number[] = accountState.colors as number[];
  const state = accountState.state;
  const height = accountState.height;
  const width = accountState.width;
  const changeCost = accountState.changeCost;
  const colors: number[][] = new Array(height)
    .fill(0)
    .map(() => new Array(width).fill(0));
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      colors[row][column] = allColors[row * width + column];
    }
  }
  return {
    state,
    height,
    width,
    changeCost,
    colors,
  };
}
