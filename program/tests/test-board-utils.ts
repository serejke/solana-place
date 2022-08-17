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