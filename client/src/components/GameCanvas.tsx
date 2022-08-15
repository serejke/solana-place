import {useBoardState} from "../providers/board/board";
import React, {useRef, useState} from "react";
import {useSelectPixel} from "../providers/board/selected";
import {
  CHANGED_COLOR,
  GRID_COLOR, HIGHLIGHTED_COLOR,
  HIGHLIGHTED_STROKE_WIDTH,
  HOVERED_PIXEL_COLOR,
  UNOCCUPIED_COLOR
} from "../utils/color-utils";
import {useBoardConfig} from "../providers/board/config";
import {areEqual, BoardState, getColor, isWithinBounds, PixelCoordinates} from "../providers/board/state";
import {useHighlightedPixel} from "../providers/board/highlighter";

const PIXEL_SIZE = 10;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>();

  const boardState = useBoardState();
  const selectPixel = useSelectPixel();
  const highlightedPixel = useHighlightedPixel();
  const showGrid = useBoardConfig().showGrid;

  const [hoveredPixel, setHoveredPixel] = useState<PixelCoordinates>();

  // Used for optimization.
  const currentBoardState = useRef<BoardState>();

  React.useEffect(() => {
    if (!boardState) return;
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
  }, [boardState, canvasSize]);

  React.useEffect(() => {
    if (!canvasSize) return;

    const canvasNode = canvasRef.current;
    if (canvasNode) {
      currentBoardState.current = undefined;
      scaleCanvas(canvasNode, canvasSize.width, canvasSize.height);
    }

    const canvasGridNode = canvasGridRef.current;
    if (canvasGridNode) {
      scaleCanvas(canvasGridNode, canvasSize.width, canvasSize.height);
    }

    const canvasHelperNode = canvasHelperRef.current;
    if (canvasHelperNode) {
      scaleCanvas(canvasHelperNode, canvasSize.width, canvasSize.height);
    }
  }, [canvasSize]);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (!boardState) return;
    if (!canvasSize) return;
    drawBoard(ctx, boardState, canvasSize, currentBoardState.current);
    drawUnoccupiedFiller(ctx, boardState, canvasSize);
    currentBoardState.current = boardState;
  }, [boardState, canvasSize, showGrid]);

  React.useEffect(() => {
    if (!canvasSize) return;
    const gridCtx = canvasGridRef.current?.getContext("2d");
    if (!gridCtx) return;

    const gridRows = Math.round(canvasSize.height / PIXEL_SIZE);
    const gridColumns = Math.round(canvasSize.width / PIXEL_SIZE);

    drawGrid(gridCtx, gridRows, gridColumns);
  }, [canvasSize])

  React.useEffect(() => {
    if (!highlightedPixel) return;
    const ctx = canvasHelperRef.current?.getContext("2d");
    if (!ctx) return;
    const coordinates = highlightedPixel.pixelCoordinates;
    highlightPixel(ctx, coordinates, HIGHLIGHTED_COLOR);
    return () => clearHighlightedOrHoveredPixel(ctx, coordinates)
  }, [highlightedPixel])


  React.useEffect(() => {
    if (!hoveredPixel) return;
    const ctx = canvasHelperRef.current?.getContext("2d");
    if (!ctx) return;
    hoverPixel(ctx, hoveredPixel, HOVERED_PIXEL_COLOR);
    return () => clearHighlightedOrHoveredPixel(ctx, hoveredPixel);
  }, [hoveredPixel])

  const onClickCallback: CanvasCallback = React.useCallback(({position}) => {
    if (!boardState) return;
    const pixelCoordinates = getPixelCoordinates(position);
    if (!isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) {
      return;
    }
    selectPixel({
      pixelCoordinates,
      canvasPosition: position
    });
  }, [selectPixel, boardState]);

  const onMouseMoveCallback: CanvasCallback = React.useCallback(({ctx, position}) => {
    if (!boardState) return;
    const pixelCoordinates = getPixelCoordinates(position);
    if (isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) {
      setHoveredPixel(pixelCoordinates);
    } else {
      setHoveredPixel(undefined);
    }
  }, [boardState, setHoveredPixel]);

  const onClick = useCanvasCallback(onClickCallback);
  const onMouseMove = useCanvasCallback(onMouseMoveCallback);
  const canvasStyle = React.useMemo(() =>
    canvasSize ?? { width: 0, height: 0 }, [canvasSize]
  )

  return (
    <div className="game-stage">
      <canvas
        className="game-canvas"
        style={canvasStyle}
        ref={canvasRef}
        onClick={onClick}
        onMouseMove={onMouseMove}
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

export type CanvasPosition = { x: number, y: number; }

type CanvasCallback = ({ctx, position}: { ctx: CanvasRenderingContext2D, position: CanvasPosition }) => void;

function scaleCanvas(canvasNode: HTMLCanvasElement, width: number, height: number) {
  const ctx = canvasNode.getContext("2d");
  if (!ctx) return;
  const devicePixelRatio = window.devicePixelRatio
  canvasNode.width = Math.floor(devicePixelRatio * width);
  canvasNode.height = Math.floor(devicePixelRatio * height);
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

function hoverPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningPosition(pixelCoordinates);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
}

function highlightPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string) {
  const {x: px, y: py} = getPixelBeginningPosition(pixelCoordinates);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = HIGHLIGHTED_STROKE_WIDTH;
  ctx.arc(px + PIXEL_SIZE / 2, py + PIXEL_SIZE / 2, PIXEL_SIZE, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function clearHighlightedOrHoveredPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates) {
  const {x: px, y: py} = getPixelBeginningPosition(pixelCoordinates);
  ctx.clearRect(px - PIXEL_SIZE, py - PIXEL_SIZE, PIXEL_SIZE * 3, PIXEL_SIZE * 3);
}

function drawGrid(ctx: CanvasRenderingContext2D, rows: number, columns: number) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = GRID_COLOR;
  for (let column = 0; column < columns; column++) {
    ctx.moveTo(column * PIXEL_SIZE, 0);
    ctx.lineTo(column * PIXEL_SIZE, rows * PIXEL_SIZE);
  }
  for (let row = 0; row < rows; row++) {
    ctx.moveTo(0, row * PIXEL_SIZE);
    ctx.lineTo(columns * PIXEL_SIZE, row * PIXEL_SIZE);
  }
  ctx.stroke();
}

function colorPixel(ctx: CanvasRenderingContext2D, pixelCoordinates: PixelCoordinates, color: string | null) {
  const {x: px, y: py} = getPixelBeginningPosition(pixelCoordinates);
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  } else {
    ctx.clearRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  }
}

function drawPixel(
  ctx: CanvasRenderingContext2D,
  boardState: BoardState,
  row: number,
  column: number
) {
  const color = getColor(boardState, row, column);
  if (color === undefined) {
    return;
  }

  colorPixel(ctx, {row, column}, color);

  const isChanged = boardState.changed.find((pixel) => areEqual(pixel.coordinates, {row, column}))
  if (isChanged) {
    hoverPixel(ctx, {row, column}, CHANGED_COLOR);
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
      drawPixel(ctx, boardState, row, column);
    }
  }
}

function drawUnoccupiedFiller(
  ctx: CanvasRenderingContext2D,
  boardState: BoardState,
  canvasSize: CanvasSize,
) {
  ctx.fillStyle = UNOCCUPIED_COLOR;
  const unoccupiedWidth = canvasSize.width - boardState.width * PIXEL_SIZE;
  if (unoccupiedWidth > 0) {
    ctx.fillRect(boardState.width * PIXEL_SIZE, 0, unoccupiedWidth, canvasSize.height);
  }

  const unoccupiedHeight = canvasSize.height - boardState.height * PIXEL_SIZE;
  if (unoccupiedHeight > 0) {
    ctx.fillRect(0, boardState.height * PIXEL_SIZE, canvasSize.width, unoccupiedHeight);
  }
}

function useCanvasCallback(
  callback: CanvasCallback
): (e: React.MouseEvent<HTMLCanvasElement>) => void {
  return React.useCallback((e) => {
    const canvas = e.currentTarget;
    const position = getCanvasPosition(canvas, e);
    if (!position) return;
    const context2D = canvas.getContext("2d");
    if (!context2D) return;
    callback({ctx: context2D, position});
  }, [callback]);
}

function getPixelCoordinates({x, y}: CanvasPosition): PixelCoordinates {
  return {
    row: Math.floor(y / PIXEL_SIZE),
    column: Math.floor(x / PIXEL_SIZE)
  }
}

function getCanvasPosition(
  canvas: HTMLCanvasElement,
  e: React.MouseEvent<HTMLCanvasElement>
): CanvasPosition | undefined {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  if (cx < 0 || cy < 0) {
    return undefined;
  }
  return {
    x: cx,
    y: cy
  };
}

function getPixelBeginningPosition({row, column}: PixelCoordinates): { x: number, y: number } {
  // x - horizontal axis, y - vertical axis
  return {
    x: column * PIXEL_SIZE,
    y: row * PIXEL_SIZE,
  }
}