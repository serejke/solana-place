import {getColorByIndex} from "../utils/colorUtils";
import {PixelCoordinates} from "./pixelCoordinates";

export type BoardState = {
  height: number,
  width: number,
  colors: number[][]
};

export function areEqual(one: PixelCoordinates, two: PixelCoordinates) {
  return one.row === two.row && one.column === two.column;
}

export function isWithinBounds(boardState: BoardState, row: number, column: number): boolean {
  return 0 <= row && row < boardState.height && 0 <= column && column < boardState.width;
}

export function getColor(boardState: BoardState, row: number, column: number): string | null | undefined {
  if (isWithinBounds(boardState, row, column)) {
    return getColorByIndex(boardState.colors[row][column]);
  }
  return undefined;
}