import {getColorByIndex} from "../utils/colorUtils";
import {PixelCoordinates} from "./pixelCoordinates";
import {ChangedPixel} from "./changedPixel";
import {TransactionSignature} from "@solana/web3.js";

export type BoardState = {
  height: number,
  width: number,
  colors: number[][],
  changed: ChangedPixel[],
  pendingTransaction: TransactionSignature | null,
  pendingTransactionIntervalId: number | null;
};

export function areEqual(one: PixelCoordinates, two: PixelCoordinates) {
  return one.row === two.row && one.column === two.column;
}

export function isWithinBounds(boardState: BoardState, row: number, column: number): boolean {
  return 0 <= row && row < boardState.height && 0 <= column && column < boardState.width;
}

export function getColor(boardState: BoardState, row: number, column: number): string | null | undefined {
  if (isWithinBounds(boardState, row, column)) {
    const changedPixel = boardState.changed.find((pixel) => areEqual(pixel.coordinates, {row, column}));
    if (changedPixel) {
      return getColorByIndex(changedPixel.newColor);
    } else {
      return getColorByIndex(boardState.colors[row][column]);
    }
  }
  return undefined;
}