import {Buffer} from "buffer";

type Board = {
  state: number,
  height: number,
  width: number,
  colors: Buffer
}

export const emptyBoard: (height, width, changeCost) => Board =
  (height: number, width: number, changeCost: number) => ({
    state: 0,
    height,
    width,
    changeCost,
    colors: Buffer.from(Array(height * width).fill(0))
  })

export const CHANGE_COLOR_ENCODING_LENGTH = 5;
export type ChangeColorRequest = { row: number, column: number, color: number };

export function encodeChangeColorRequests(
  changes: ChangeColorRequest[]
): Buffer {
  const encodedChanges = Buffer.alloc(changes.length * CHANGE_COLOR_ENCODING_LENGTH);
  changes.map(({row, column, color}, index) => {
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
  newBoard.colors = Buffer.from(newBoard.colors);
  newBoard.colors.writeUInt8(color, row * board.width + column);
  newBoard.state = board.state + 1;
  return newBoard;
}
