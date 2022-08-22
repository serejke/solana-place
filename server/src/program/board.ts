// noinspection DuplicatedCode

import {BoardState} from "../model/boardState";
import {GameEvent, PixelChangedEvent} from "../model/gameEvent";

type AccountBoardState = {
  colors: unknown,
  state: number,
  height: number,
  width: number,
  changeCost: number
};

type ProgramPixelColorChangedEvent = {
  state: number,
  row: number,
  column: number,
  oldColor: number,
  newColor: number
}

export function parseBoardStateFromAccount(accountState: AccountBoardState): BoardState {
  const colorsBuffer: Buffer = accountState.colors as Buffer;
  const state = accountState.state;
  const height = accountState.height;
  const width = accountState.width;
  const changeCost = accountState.changeCost;
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
    changeCost,
    colors
  };
}

export function parseProgramPixelColorChangedEvent(event: ProgramPixelColorChangedEvent): GameEvent {
  return {type: "pixelChangedEvent", ...event};
}
