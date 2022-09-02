import {useBoardState} from "../providers/board/boardState";
import React, {useRef, useState} from "react";
import {
  CHANGED_COLOR,
  GRID_COLOR,
  HIGHLIGHTED_COLOR,
  HIGHLIGHTED_STROKE_WIDTH,
  HOVERED_PIXEL_COLOR,
  PENDING_COLOR
} from "../utils/colorUtils";
import {useBoardConfig} from "../providers/board/boardConfig";
import {BoardState, getColor, isWithinBounds} from "../model/boardState";
import {useHighlightedPixel} from "../providers/board/highlightedPixel";
import {SelectedPixel} from "./PixelColorPicker";
import {PixelCoordinates} from "../model/pixelCoordinates";
import {ClientPosition, useZooming, ZoomingState, ZoomPivot} from "providers/board/zooming";
import {CanvasPosition} from "../model/canvasPosition";

export const PIXEL_SIZE = 4;

type GameCanvasProps = {
  onPixelClicked: (selectedPixel: SelectedPixel) => void
};

export function GameCanvas({onPixelClicked}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>();

  const boardState = useBoardState();
  const highlightedPixel = useHighlightedPixel();
  const showGrid = useBoardConfig().showGrid;
  const zoomingState = useZooming();

  const [hoveredPixel, setHoveredPixel] = useState<PixelCoordinates>();

  // Used for optimization.
  const currentBoardState = useRef<BoardState>();

  React.useEffect(() => {
    if (!boardState?.width || !boardState?.height) return;
    const resizeListener = () => {
      const newWidth = Math.max(boardState.width * PIXEL_SIZE, window.innerWidth);
      const newHeight = Math.max(boardState.height * PIXEL_SIZE, window.innerHeight);

      if (canvasSize
        && canvasSize.width === newWidth
        && canvasSize.height === newHeight
      ) {
        // No need to resize.
        return;
      }

      setCanvasSize({
        width: newWidth,
        height: newHeight
      })
    };
    resizeListener();
    window.addEventListener("resize", resizeListener)
    return () => window.removeEventListener("resize", resizeListener)
  }, [boardState?.width, boardState?.height, canvasSize]);

  // Resize and zoom canvas and translate origin.
  React.useEffect(() => {
    if (!canvasSize) return;

    scaleCanvas(canvasRef.current!, canvasSize, zoomingState);
    scaleCanvas(canvasGridRef.current!, canvasSize, zoomingState);
    scaleCanvas(canvasHelperRef.current!, canvasSize, zoomingState);
    zoomingState.onZoomUpdated();

    // Drop the board cache to force the re-paint.
    currentBoardState.current = undefined;
  }, [canvasSize, zoomingState]);

  // Draw board state.
  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (!boardState) return;
    if (!canvasSize) return;
    drawBoard(ctx, boardState, canvasSize, currentBoardState.current);
    currentBoardState.current = boardState;
  }, [boardState, canvasSize, showGrid, zoomingState]);

  // Draw grid.
  React.useEffect(() => {
    if (!canvasSize) return;
    const gridCtx = canvasGridRef.current?.getContext("2d");
    if (!gridCtx) return;

    const gridRows = Math.round(canvasSize.height / PIXEL_SIZE);
    const gridColumns = Math.round(canvasSize.width / PIXEL_SIZE);

    drawGrid(gridCtx, gridRows, gridColumns);
  }, [canvasSize, zoomingState]);

  // Draw hovered, highlighted and changed pixels, if any.
  const isPendingTransaction = boardState?.pendingTransaction != null;
  React.useEffect(() => {
    const helperCtx = canvasHelperRef.current?.getContext("2d");
    if (!helperCtx) return;
    if (highlightedPixel) {
      highlightPixel(helperCtx, highlightedPixel.pixelCoordinates, HIGHLIGHTED_COLOR);
    }
    if (hoveredPixel) {
      hoverPixel(helperCtx, hoveredPixel, HOVERED_PIXEL_COLOR);
    }
    if (boardState?.changed) {
      const color = isPendingTransaction ? PENDING_COLOR : CHANGED_COLOR;
      boardState.changed.forEach((changedPixel) => {
        hoverPixel(helperCtx, changedPixel.coordinates, color);
      });
    }
    return () => {
      highlightedPixel && clearHighlightedOrHoveredPixel(helperCtx, highlightedPixel.pixelCoordinates);
      hoveredPixel && clearHighlightedOrHoveredPixel(helperCtx, hoveredPixel);
      boardState?.changed && boardState.changed.forEach((changedPixel) => {
        clearHighlightedOrHoveredPixel(helperCtx, changedPixel.coordinates);
      })
    }
  }, [hoveredPixel, highlightedPixel, boardState?.changed, isPendingTransaction, zoomingState])

  const onClickCallback: CanvasCallback = React.useCallback(({canvasPosition, eventPosition}) => {
    if (!boardState) return;
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (!isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) {
      return;
    }
    onPixelClicked({
      pixelCoordinates,
      popupPosition: eventPosition
    })
  }, [boardState, onPixelClicked]);

  const onMouseMoveCallback: CanvasCallback = React.useCallback(({canvasPosition}) => {
    if (!boardState) return;
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) {
      setHoveredPixel(pixelCoordinates);
    } else {
      setHoveredPixel(undefined);
    }
  }, [boardState, setHoveredPixel]);

  const onMouseWheelCallback: CanvasCallback = React.useCallback(({canvasPosition, eventPosition, event}) => {
    const deltaY = event.deltaY;
    if (!deltaY) return;
    const newPivot: ZoomPivot = {...canvasPosition, ...eventPosition};
    if (deltaY > 0) {
      zoomingState.zoomIn(newPivot);
    } else if (deltaY < 0) {
      zoomingState.zoomOut(newPivot);
    }
  }, [zoomingState]);

  const onZoomKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hoveredPixel) return;
    const canvasPosition = getPixelBeginningCanvasPosition(hoveredPixel);
    const clientPosition = getClientPositionByCanvasPosition(canvasRef.current!, canvasPosition, zoomingState);
    const newPivot = {...canvasPosition, ...clientPosition};
    if (e.code === "Equal" || e.code === "Plus") {
      zoomingState.zoomIn(newPivot)
    } else if (e.code === "Minus") {
      zoomingState.zoomOut(newPivot);
    }
  }, [hoveredPixel, zoomingState]);

  const onClick = useCanvasCallback(onClickCallback);
  const onMouseMove = useCanvasCallback(onMouseMoveCallback);
  const onMouseWheel = useCanvasCallback(onMouseWheelCallback);
  const canvasStyle = React.useMemo(() =>
    canvasSize ?? {width: 0, height: 0}, [canvasSize]
  )

  const gameStageRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // Focus the game-stage to enable the onKeyDown event listener on rendering.
    gameStageRef.current!.focus();
  }, [])

  return (
    <div
      ref={gameStageRef}
      tabIndex={0}
      className="game-stage"
      onKeyDown={onZoomKeyDown}
    >
      <canvas
        className="game-canvas"
        style={canvasStyle}
        ref={canvasRef}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onWheel={onMouseWheel}
      />
      <canvas
        className={`game-grid-canvas ${showGrid ? "" : "hide"}`}
        style={canvasStyle}
        ref={canvasGridRef}
      />
      <canvas
        className="game-helper-canvas"
        style={canvasStyle}
        ref={canvasHelperRef}
      />
    </div>
  );
}

type CanvasSize = { width: number, height: number }

type CanvasCallback = ({canvasPosition, eventPosition, event}: {
  canvasPosition: CanvasPosition,
  eventPosition: ClientPosition,
  event: CanvasEvent
}) => void;

function scaleCanvas(
  canvasNode: HTMLCanvasElement,
  canvasSize: CanvasSize,
  zoomingState: ZoomingState
) {
  const ctx = canvasNode.getContext("2d");
  if (!ctx) return;
  const {dpr, zoom} = zoomingState;
  canvasNode.width = Math.floor(dpr * canvasSize.width);
  canvasNode.height = Math.floor(dpr * canvasSize.height);
  const scale = dpr * zoom;
  ctx.setTransform({
    a: scale,
    b: 0,
    c: 0,
    d: scale,
    e: zoomingState.canvasTranslateX,
    f: zoomingState.canvasTranslateY
  })
}

function hoverPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
}

function highlightPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = HIGHLIGHTED_STROKE_WIDTH;
  ctx.arc(px + PIXEL_SIZE / 2, py + PIXEL_SIZE / 2, PIXEL_SIZE, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function clearHighlightedOrHoveredPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.clearRect(px - PIXEL_SIZE, py - PIXEL_SIZE, PIXEL_SIZE * 3, PIXEL_SIZE * 3);
}

function drawGrid(ctx: CanvasRenderingContext2D, rows: number, columns: number) {
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

function drawPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string | null) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  } else {
    ctx.clearRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  }
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  boardState: BoardState,
  canvasSize: CanvasSize,
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

interface CanvasEvent {
  currentTarget: EventTarget & HTMLCanvasElement,
  clientX: number,
  clientY: number,
  deltaX?: number,
  deltaY?: number
}

function useCanvasCallback(
  callback: CanvasCallback
): (e: CanvasEvent) => void {
  const zoomingState = useZooming();
  return React.useCallback((event) => {
    const canvas = event.currentTarget;
    const canvasPosition = getCanvasPosition(canvas, event, zoomingState);
    const clientPosition = getClientPosition(canvas, event);
    if (!canvasPosition) return;
    callback({
      eventPosition: clientPosition,
      canvasPosition,
      event
    });
  }, [callback, zoomingState]);
}

function getPixelCoordinates({x, y}: CanvasPosition): PixelCoordinates {
  return {
    row: Math.floor(y / PIXEL_SIZE),
    column: Math.floor(x / PIXEL_SIZE)
  }
}

function getCanvasPosition(
  canvas: HTMLCanvasElement,
  event: CanvasEvent,
  zoomingState: ZoomingState
): CanvasPosition | undefined {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const {clientX, clientY} = getClientPosition(canvas, event);
  if (clientX < 0 || clientY < 0) {
    return undefined;
  }
  const dpr = zoomingState.dpr;
  const translateX = zoomingState.canvasTranslateX;
  const translateY = zoomingState.canvasTranslateY;
  const x = Math.floor((clientX - translateX / dpr) / zoomingState.zoom);
  const y = Math.floor((clientY - translateY / dpr) / zoomingState.zoom);
  return {x, y};
}

function getClientPosition(
  canvas: HTMLCanvasElement,
  event: CanvasEvent
): ClientPosition {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX - rect.left;
  const clientY = event.clientY - rect.top;
  return {clientX, clientY};
}

function getClientPositionByCanvasPosition(
  canvas: HTMLCanvasElement,
  canvasPosition: CanvasPosition,
  zoomingState: ZoomingState
): ClientPosition {
  const ctx = canvas.getContext("2d");
  if (!ctx) return {clientX: 0, clientY: 0};
  const rect = canvas.getBoundingClientRect();

  const transform = ctx.getTransform();
  const translateX = -transform.e;
  const translateY = -transform.f;
  const clientX = Math.floor(canvasPosition.x * zoomingState.zoom - translateX / zoomingState.dpr + rect.left);
  const clientY = Math.floor(canvasPosition.y * zoomingState.zoom - translateY / zoomingState.dpr + rect.top);
  return {clientX, clientY};
}

function getPixelBeginningCanvasPosition({row, column}: PixelCoordinates): CanvasPosition {
  // x - horizontal axis, y - vertical axis
  return {
    x: column * PIXEL_SIZE,
    y: row * PIXEL_SIZE,
  }
}