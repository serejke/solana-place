import {useBoardState} from "../providers/board/boardState";
import React, {useReducer, useRef, useState} from "react";
import {
  CHANGED_COLOR, getColorByIndex,
  GRID_COLOR,
  HIGHLIGHTED_COLOR,
  PENDING_COLOR
} from "../utils/colorUtils";
import {useBoardConfig} from "../providers/board/boardConfig";
import {BoardState, getColor, isWithinBounds} from "../model/boardState";
import {useHighlightedPixel} from "../providers/board/highlightedPixel";
import {SelectedPixel} from "./PixelColorPicker";
import {PixelCoordinates} from "../model/pixelCoordinates";
import {usePendingTransaction} from "../providers/transactions/pendingTransaction";
import {useCurrentPixelColorState} from "../providers/color/currentColor";

export const PIXEL_SIZE = 4;

type GameCanvasProps = {
  onPixelClicked: (selectedPixel: SelectedPixel) => void,
  onZoomChanged: (zoom: number) => void
};

export function GameCanvas({onPixelClicked, onZoomChanged}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);

  const boardState = useBoardState();
  const {changedPixels, pendingTransaction} = usePendingTransaction();
  const highlightedPixel = useHighlightedPixel();
  const showGrid = useBoardConfig().showGrid;
  const [zoomingState, zoomingDispatch] = useZooming();

  const [hoveredPixel, setHoveredPixel] = useState<PixelCoordinates>();
  const currentPixelColor = useCurrentPixelColorState()[0];

  // Used for optimization.
  const currentBoardState = useRef<BoardState>();

  React.useEffect(() => {
    if (!boardState?.width || !boardState?.height) return;
    const resizeListener = () => {
      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;
      const styleProportion = 0.9;
      let canvasStyle;
      if (innerWidth > innerHeight) {
        const height = Math.floor(innerHeight * styleProportion);
        const width = Math.floor(height * boardState.width / boardState.height);
        canvasStyle = {width, height};
      } else {
        const width = Math.floor(innerWidth * styleProportion);
        const height = Math.floor(width * boardState.height / boardState.width);
        canvasStyle = {width, height};
      }
      const canvasSize = {
        width: boardState.width * PIXEL_SIZE,
        height: boardState.height * PIXEL_SIZE
      };
      zoomingDispatch({
        type: "canvasInstalled",
        canvasSize,
        canvasStyle
      });
    };
    resizeListener();
    window.addEventListener("resize", resizeListener)
    return () => window.removeEventListener("resize", resizeListener)
  }, [boardState?.width, boardState?.height, zoomingDispatch]);

  // Resize and zoom canvas and translate origin according to the zooming state.
  React.useEffect(() => {
    scaleCanvas(canvasRef.current!, zoomingState);
    scaleCanvas(canvasGridRef.current!, zoomingState);
    scaleCanvas(canvasHelperRef.current!, zoomingState);
    // Drop the board cache to force the re-paint.
    currentBoardState.current = undefined;
    onZoomChanged(zoomingState.zoom);
  }, [zoomingState, onZoomChanged]);

  // Draw board state.
  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (!boardState) return;
    drawBoard(ctx, boardState, currentBoardState.current);
    currentBoardState.current = boardState;
  }, [boardState, zoomingState]);

  // Draw grid.
  React.useEffect(() => {
    if (!boardState?.height || !boardState?.width) return;
    const gridCtx = canvasGridRef.current?.getContext("2d");
    if (!gridCtx) return;

    const gridRows = boardState.height + 1;
    const gridColumns = boardState.width + 1;

    drawGrid(gridCtx, gridRows, gridColumns);
  }, [boardState?.height, boardState?.width, zoomingState]);

  // Draw hovered, highlighted and changed pixels, if any.
  const isPendingTransaction = pendingTransaction != null;
  React.useEffect(() => {
    const helperCtx = canvasHelperRef.current?.getContext("2d");
    if (!helperCtx) return;
    if (highlightedPixel) {
      highlightPixel(helperCtx, highlightedPixel.pixelCoordinates, HIGHLIGHTED_COLOR);
    }
    if (hoveredPixel) {
      drawPixel(helperCtx, hoveredPixel, currentPixelColor);
    }
    if (changedPixels) {
      const color = isPendingTransaction ? PENDING_COLOR : CHANGED_COLOR;
      changedPixels.forEach((changedPixel) => {
        const colorByIndex = getColorByIndex(changedPixel.newColor);
        drawPixel(helperCtx, changedPixel.coordinates, colorByIndex);
        highlightPixel(helperCtx, changedPixel.coordinates, color);
      });
    }
    return () => {
      highlightedPixel && clearPixel(helperCtx, highlightedPixel.pixelCoordinates);
      hoveredPixel && clearPixel(helperCtx, hoveredPixel);
      changedPixels.forEach((changedPixel) => clearPixel(helperCtx, changedPixel.coordinates))
    }
  }, [hoveredPixel, highlightedPixel, currentPixelColor, changedPixels, isPendingTransaction, zoomingState])

  const onClickCallback: CanvasCallback = React.useCallback(({canvasPosition, event}) => {
    if (!boardState) return;
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (!isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) {
      return;
    }
    onPixelClicked({
      pixelCoordinates,
      popupPosition: {clientX: event.clientX, clientY: event.clientY}
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

  const zoomInOrOut = React.useCallback((isZoomInOrOut: "in" | "out" | undefined) => {
    if (!hoveredPixel) return;
    const canvasPosition = getPixelBeginningCanvasPosition(hoveredPixel);
    const clientPositionInCanvas = getClientPositionInCanvasByCanvasPosition(canvasPosition, zoomingState);
    if (!clientPositionInCanvas) return;
    const newPivot: ZoomPivot = {...canvasPosition, ...clientPositionInCanvas};
    if (isZoomInOrOut !== undefined) {
      zoomingDispatch({
        type: "zoom",
        pivot: newPivot,
        inOurOut: isZoomInOrOut
      });
    }
  }, [hoveredPixel, zoomingState, zoomingDispatch])

  const onMouseWheelCallback: CanvasCallback = React.useCallback(({event}) => {
    const deltaY = event.deltaY;
    if (!deltaY) return;
    if (deltaY > 0) {
      zoomInOrOut("in");
    } else if (deltaY < 0) {
      zoomInOrOut("out");
    }
  }, [zoomInOrOut]);

  const onZoomKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Equal" || e.code === "Plus") {
      zoomInOrOut("in");
    } else if (e.code === "Minus") {
      zoomInOrOut("out");
    }
  }, [zoomInOrOut]);

  const onClick = useCanvasCallback(onClickCallback, zoomingState);
  const onMouseMove = useCanvasCallback(onMouseMoveCallback, zoomingState);
  const onMouseWheel = useCanvasCallback(onMouseWheelCallback, zoomingState);

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
      style={zoomingState.canvasStyle}
      onKeyDown={onZoomKeyDown}
    >
      <canvas
        className="game-canvas"
        style={zoomingState.canvasStyle}
        ref={canvasRef}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onWheel={onMouseWheel}
      />
      <canvas
        className={`game-grid-canvas ${showGrid ? "" : "hide"}`}
        style={zoomingState.canvasStyle}
        ref={canvasGridRef}
      />
      <canvas
        className="game-helper-canvas"
        style={zoomingState.canvasStyle}
        ref={canvasHelperRef}
      />
    </div>
  );
}

type CanvasSize = { width: number, height: number };
type CanvasStyle = { width: number, height: number };

type CanvasCallback = ({canvasPosition, event}: { canvasPosition: CanvasPosition, event: CanvasEvent }) => void;

function scaleCanvas(
  canvasNode: HTMLCanvasElement,
  zoomingState: ZoomingState
) {
  const ctx = canvasNode.getContext("2d");
  if (!ctx) return;
  const {zoom, canvasSize, canvasTranslateX, canvasTranslateY} = zoomingState
  canvasNode.width = canvasSize.width;
  canvasNode.height = canvasSize.height;
  ctx.setTransform({
    a: zoom,
    b: 0,
    c: 0,
    d: zoom,
    e: canvasTranslateX,
    f: canvasTranslateY
  })
}

function highlightPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
}

function clearPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates) {
  const {x: px, y: py} = getPixelBeginningCanvasPosition(pixelCoordinates);
  ctx.clearRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
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
  const clientPositionInCanvas = getEventClientPositionInCanvas(canvas, event);
  if (!clientPositionInCanvas) {
    return undefined;
  }
  const {clientX, clientY} = clientPositionInCanvas;
  const {canvasTranslateX, canvasTranslateY, canvasSize, canvasStyle} = zoomingState;
  const k = canvasSize.width / canvasStyle.width;
  const x = (k * clientX - canvasTranslateX) / zoomingState.zoom;
  const y = (k * clientY - canvasTranslateY) / zoomingState.zoom;
  return {x, y};
}

function getEventClientPositionInCanvas(
  canvas: HTMLCanvasElement,
  event: CanvasEvent
): ClientPositionInCanvas | undefined {
  const rect = canvas.getBoundingClientRect();
  if (event.clientX > rect.right || event.clientY > rect.bottom) {
    return undefined;
  }
  const clientX = event.clientX - rect.left;
  const clientY = event.clientY - rect.top;
  return {clientX, clientY};
}

function getClientPositionInCanvasByCanvasPosition(
  canvasPosition: CanvasPosition,
  zoomingState: ZoomingState
): ClientPositionInCanvas {
  const {zoom, canvasTranslateX, canvasTranslateY, canvasSize, canvasStyle} = zoomingState;
  const k = canvasSize.width / canvasStyle.width;
  const clientX = (canvasPosition.x * zoom + canvasTranslateX) / k;
  const clientY = (canvasPosition.y * zoom + canvasTranslateY) / k;
  return {clientX, clientY};
}

function getPixelBeginningCanvasPosition({row, column}: PixelCoordinates): CanvasPosition {
  // x - horizontal axis, y - vertical axis
  return {
    x: column * PIXEL_SIZE,
    y: row * PIXEL_SIZE,
  }
}

type ZoomingState = {
  canvasSize: CanvasSize,
  canvasStyle: CanvasStyle,
  zoom: number,
  zoomPivot: ZoomPivot,
  canvasTranslateX: number,
  canvasTranslateY: number
}

const ZERO_ZOOM_PIVOT: ZoomPivot = {x: 0, y: 0, clientX: 0, clientY: 0}

type CanvasInstalled = {
  "type": "canvasInstalled",
  canvasSize: CanvasSize,
  canvasStyle: CanvasStyle
}
type Zoom = {
  "type": "zoom",
  pivot: ZoomPivot,
  inOurOut: "in" | "out"
}

type ZoomingAction = CanvasInstalled | Zoom;

function zoomingReducer(state: ZoomingState, action: ZoomingAction): ZoomingState {
  switch (action.type) {
    case "canvasInstalled":
      return {
        ...state,
        canvasStyle: action.canvasStyle,
        canvasSize: action.canvasSize
      };
    case "zoom":
      const zoom = state.zoom;
      const index = ZOOMING_OPTIONS.indexOf(zoom);
      let newZoom = zoom;
      if (action.inOurOut === "in" && index < ZOOMING_OPTIONS.length - 1) {
        newZoom = ZOOMING_OPTIONS[index + 1];
      } else if (action.inOurOut === "out" && index > 0) {
        newZoom = ZOOMING_OPTIONS[index - 1];
      }
      if (newZoom !== zoom) {
        const newZoomPivot = newZoom === 1 ? ZERO_ZOOM_PIVOT : action.pivot;
        const k = state.canvasSize.width / state.canvasStyle.width;
        const canvasTranslateX = Math.min(0, k * newZoomPivot.clientX - newZoom * newZoomPivot.x);
        const canvasTranslateY = Math.min(0, k * newZoomPivot.clientY - newZoom * newZoomPivot.y);
        return {
          ...state,
          zoom: newZoom,
          zoomPivot: newZoomPivot,
          canvasTranslateX,
          canvasTranslateY
        }
      }
      return state;
  }
}

function useZooming(): [ZoomingState, React.Dispatch<ZoomingAction>] {
  const [zoomingState, zoomingDispatch] = useReducer(zoomingReducer, {
    zoom: 1.0,
    canvasSize: {height: 0, width: 0},
    canvasStyle: {height: 0, width: 0},
    canvasTranslateX: 0,
    canvasTranslateY: 0,
    zoomPivot: ZERO_ZOOM_PIVOT,
  });
  return [zoomingState, zoomingDispatch];
}

type CanvasPosition = { x: number, y: number; }
type ClientPositionInCanvas = { clientX: number, clientY: number };
type ZoomPivot = CanvasPosition & ClientPositionInCanvas;

const ZOOMING_OPTIONS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8];