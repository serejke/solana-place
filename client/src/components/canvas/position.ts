import { CanvasEvent, CanvasPosition, ClientPositionInCanvas } from "./types";
import { PixelCoordinates } from "../../model/pixelCoordinates";
import { ZoomingState } from "../../providers/zooming/zooming";

export const PIXEL_SIZE = 4;

export function getPixelCoordinates({
  x,
  y,
}: CanvasPosition): PixelCoordinates {
  return {
    row: Math.floor(y / PIXEL_SIZE),
    column: Math.floor(x / PIXEL_SIZE),
  };
}

export function getCanvasPosition(
  canvas: HTMLCanvasElement,
  event: CanvasEvent,
  zoomingState: ZoomingState
): CanvasPosition | undefined {
  const clientPositionInCanvas = getEventClientPositionInCanvas(canvas, event);
  if (!clientPositionInCanvas) {
    return undefined;
  }
  const { clientX, clientY } = clientPositionInCanvas;
  const { canvasTranslateX, canvasTranslateY, canvasSize, canvasStyle } =
    zoomingState;
  const k = canvasSize.width / canvasStyle.width;
  const x = (k * clientX - canvasTranslateX) / zoomingState.zoom;
  const y = (k * clientY - canvasTranslateY) / zoomingState.zoom;
  return { x, y };
}

export function getEventClientPositionInCanvas(
  canvas: HTMLCanvasElement,
  event: CanvasEvent
): ClientPositionInCanvas | undefined {
  const rect = canvas.getBoundingClientRect();
  if (event.clientX > rect.right || event.clientY > rect.bottom) {
    return undefined;
  }
  const clientX = event.clientX - rect.left;
  const clientY = event.clientY - rect.top;
  return { clientX, clientY };
}

export function getClientPositionInCanvasByCanvasPosition(
  canvasPosition: CanvasPosition,
  zoomingState: ZoomingState
): ClientPositionInCanvas {
  const { zoom, canvasTranslateX, canvasTranslateY, canvasSize, canvasStyle } =
    zoomingState;
  const k = canvasSize.width / canvasStyle.width;
  const clientX = (canvasPosition.x * zoom + canvasTranslateX) / k;
  const clientY = (canvasPosition.y * zoom + canvasTranslateY) / k;
  return { clientX, clientY };
}

export function getPixelBeginningCanvasPosition({
  row,
  column,
}: PixelCoordinates): CanvasPosition {
  return {
    x: column * PIXEL_SIZE,
    y: row * PIXEL_SIZE,
  };
}
