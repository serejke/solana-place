export type CanvasSize = { width: number, height: number };
export type CanvasStyle = { width: number, height: number };
export type CanvasCallback = ({canvasPosition, event}: { canvasPosition: CanvasPosition, event: CanvasEvent }) => void;

export type CanvasEvent = {
  currentTarget: EventTarget & HTMLCanvasElement,
  clientX: number,
  clientY: number,
  deltaX?: number,
  deltaY?: number
}

export type CanvasPosition = { x: number, y: number; }
export type ClientPositionInCanvas = { clientX: number, clientY: number };