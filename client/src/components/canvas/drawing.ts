import {PixelCoordinates} from "../../model/pixelCoordinates";
import {getPixelBeginningCanvasPosition, PIXEL_SIZE} from "./position";
import {GRID_COLOR} from "../../utils/colorUtils";
import {BoardState, getColor} from "../../model/boardState";

export function highlightPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
}

export function clearPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.clearRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
}

export function drawGrid(ctx: CanvasRenderingContext2D, rows: number, columns: number) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = GRID_COLOR;
  for (let column = 0; column <= columns; column++) {
    ctx.moveTo(column * PIXEL_SIZE, 0);
    ctx.lineTo(column * PIXEL_SIZE, rows * PIXEL_SIZE);
  }
  for (let row = 0; row <= rows; row++) {
    ctx.moveTo(0, row * PIXEL_SIZE);
    ctx.lineTo(columns * PIXEL_SIZE, row * PIXEL_SIZE);
  }
  ctx.stroke();
}

export function drawPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string | null) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  } else {
    ctx.clearRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  }
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  boardState: BoardState,
  currentBoardState: BoardState | undefined
) {
  for (let row = 0; row < boardState.height; row++) {
    for (let column = 0; column < boardState.width; column++) {
      const color = getColor(boardState, row, column);
      if (currentBoardState
        && boardState.width === currentBoardState?.width
        && boardState.height === currentBoardState?.height
        && color === getColor(currentBoardState, row, column)
      ) {
        // No need to re-paint.
        continue;
      }
      if (color !== undefined) {
        drawPixel(ctx, {row, column}, color);
      }
    }
  }
}