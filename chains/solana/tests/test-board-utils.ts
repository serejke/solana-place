import { Buffer } from "buffer";
import { MAX_HEIGHT, MAX_WIDTH } from "../migrations/game-account-util";
import { PublicKey } from "@solana/web3.js";

type Board = {
  authority: PublicKey;
  state: number;
  height: number;
  width: number;
  changeCost: number;
  colors: number[];
};

export function emptyBoard(
  authority: PublicKey,
  height: number,
  width: number,
  changeCost: number
): Board {
  const colors = Array(MAX_HEIGHT * MAX_WIDTH).fill(0);
  return {
    authority,
    state: 0,
    height,
    width,
    changeCost,
    colors: colors,
  };
}

export const CHANGE_COLOR_ENCODING_LENGTH = 5;
export type ChangeColorRequest = { row: number; column: number; color: number };

export function encodeChangeColorRequests(
  changes: ChangeColorRequest[]
): Buffer {
  const encodedChanges = Buffer.alloc(
    changes.length * CHANGE_COLOR_ENCODING_LENGTH
  );
  changes.map(({ row, column, color }, index) => {
    const startIndex = index * CHANGE_COLOR_ENCODING_LENGTH;
    encodedChanges.writeUint16BE(row, startIndex);
    encodedChanges.writeUint16BE(column, startIndex + 2);
    encodedChanges.writeUInt8(color, startIndex + 4);
  });
  return encodedChanges;
}

export function changeColor(
  board: Board,
  row: number,
  column: number,
  color: number
): Board {
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const index = row * board.width + column;
  newBoard.authority = board.authority;
  newBoard.colors[index] = color;
  newBoard.state = board.state + 1;
  return newBoard;
}
