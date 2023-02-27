import { ZoomingState } from "../../providers/zooming/zooming";

export function scaleCanvas(
  canvasNode: HTMLCanvasElement,
  zoomingState: ZoomingState
) {
  const ctx = canvasNode.getContext("2d");
  if (!ctx) return;
  const { zoom, canvasSize, canvasTranslateX, canvasTranslateY } = zoomingState;
  canvasNode.width = canvasSize.width;
  canvasNode.height = canvasSize.height;
  ctx.setTransform({
    a: zoom,
    b: 0,
    c: 0,
    d: zoom,
    e: canvasTranslateX,
    f: canvasTranslateY,
  });
}
