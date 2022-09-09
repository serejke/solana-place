import {CanvasCallback, CanvasEvent} from "./types";
import {ZoomingState} from "../../providers/zooming/zooming";
import React from "react";
import {getCanvasPosition, getEventClientPositionInCanvas} from "./position";

export function useCanvasCallback(
  callback: CanvasCallback,
  zoomingState: ZoomingState
): (e: CanvasEvent) => void {
  return React.useCallback((event) => {
    const canvas = event.currentTarget;
    const canvasPosition = getCanvasPosition(canvas, event, zoomingState);
    const clientPosition = getEventClientPositionInCanvas(canvas, event);
    if (!canvasPosition || !clientPosition) return;
    callback({
      canvasPosition,
      event
    });
  }, [callback, zoomingState]);
}