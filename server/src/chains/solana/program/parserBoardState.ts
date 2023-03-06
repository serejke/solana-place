// noinspection DuplicatedCode

import { BoardState } from "../../../model/boardState";
import { parseColors } from "../../utils";

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
  const allColors = Uint8Array.from(accountState.colors as number[]);
  const state = accountState.state;
  const height = accountState.height;
  const width = accountState.width;
  const changeCost = accountState.changeCost;
  const colors = parseColors(height, width, allColors);
  return {
    state,
    height,
    width,
    changeCost,
    colors,
  };
}
