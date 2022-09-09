import {useBoardState} from "../../providers/board/boardState";
import React, {MutableRefObject, useRef, useState} from "react";
import {CHANGED_COLOR, getColorByIndex, HIGHLIGHTED_COLOR, PENDING_COLOR} from "../../utils/colorUtils";
import {useBoardConfig} from "../../providers/board/boardConfig";
import {BoardState, isWithinBounds} from "../../model/boardState";
import {useHighlightedPixel} from "../../providers/board/highlightedPixel";
import {SelectedPixel} from "../PixelColorPicker";
import {PixelCoordinates} from "../../model/pixelCoordinates";
import {usePendingTransaction} from "../../providers/transactions/pendingTransaction";
import {useCurrentPixelColorState} from "../../providers/color/currentColor";
import {useZooming, ZoomPivot} from "../../providers/zooming/zooming";
import {CanvasCallback} from "./types";
import {
  getClientPositionInCanvasByCanvasPosition,
  getPixelBeginningCanvasPosition,
  getPixelCoordinates,
  PIXEL_SIZE
} from "./position";
import {clearPixel, drawBoard, drawGrid, drawPixel, highlightPixel} from "./drawing";
import {useCanvasCallback} from "./useCanvasCallback";
import {scaleCanvas} from "./zooming";

type GameCanvasProps = {
  onPixelClicked: (selectedPixel: SelectedPixel) => void
};

export function GameCanvas({onPixelClicked}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);

  const boardState = useBoardState();
  const showGrid = useBoardConfig().showGrid;
  const [zoomingState, zoomingDispatch] = useZooming();

  const [hoveredPixel, setHoveredPixel] = useState<PixelCoordinates>();
  useCanvasResizeEffect([canvasRef, canvasGridRef, canvasHelperRef]);

  // Used for optimization.
  const currentBoardState = useRef<BoardState>();
  React.useEffect(() => {
    // Drop the board cache to force the re-paint.
    currentBoardState.current = undefined;
  }, [zoomingState]);

  useDrawBoardEffect(canvasRef, currentBoardState);
  useDrawGridEffect(canvasGridRef);
  useDrawHoveredAndHighlightedAndChangedPixelsEffect(canvasHelperRef, hoveredPixel);

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

function useCanvasResizeEffect(canvasRefs: MutableRefObject<HTMLCanvasElement | null>[]) {
  const boardState = useBoardState();
  const [zoomingState, zoomingDispatch] = useZooming();
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
    for (const canvasRef of canvasRefs) {
      scaleCanvas(canvasRef.current!, zoomingState);
    }
    // Do not add canvasRefs to the dependencies list to avoid infinite re-rendering.
    //  eslint-disable-next-line
  }, [zoomingState]);
}

function useCanvas2DContext(canvasRef: MutableRefObject<HTMLCanvasElement | null>): CanvasRenderingContext2D | undefined {
  const current = canvasRef.current !== null;
  return React.useMemo(() => {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d")!;
    // Assume the canvas context never changes.
    //  eslint-disable-next-line
  }, [current])
}

function useDrawBoardEffect(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  currentBoardState: MutableRefObject<BoardState | undefined>
) {
  const boardState = useBoardState();
  const [zoomingState] = useZooming();

  const canvasCtx = useCanvas2DContext(canvasRef);
  React.useEffect(() => {
    if (!boardState) return;
    canvasCtx && drawBoard(canvasCtx, boardState, currentBoardState.current);
    currentBoardState.current = boardState;
  }, [boardState, zoomingState, canvasCtx, currentBoardState]);
}

function useDrawGridEffect(canvasGridRef: MutableRefObject<HTMLCanvasElement | null>) {
  const boardState = useBoardState();
  const zoomingState = useZooming()[0];
  const canvasGridCtx = useCanvas2DContext(canvasGridRef);

  React.useEffect(() => {
    if (!boardState?.height || !boardState?.width) return;
    const gridRows = boardState.height + 1;
    const gridColumns = boardState.width + 1;
    canvasGridCtx && drawGrid(canvasGridCtx, gridRows, gridColumns);
  }, [boardState?.height, boardState?.width, zoomingState, canvasGridCtx]);
}

function useDrawHoveredAndHighlightedAndChangedPixelsEffect(
  canvasHelperRef: MutableRefObject<HTMLCanvasElement | null>,
  hoveredPixel: PixelCoordinates | undefined
) {
  const {pendingTransaction, changedPixels} = usePendingTransaction();
  const currentPixelColor = useCurrentPixelColorState()[0];
  const isPendingTransaction = pendingTransaction != null;
  const zoomingState = useZooming()[0];
  const highlightedPixel = useHighlightedPixel();

  const canvasHelperCtx = useCanvas2DContext(canvasHelperRef);
  React.useEffect(() => {
    if (!canvasHelperCtx) return;
    if (highlightedPixel) {
      highlightPixel(canvasHelperCtx, highlightedPixel.pixelCoordinates, HIGHLIGHTED_COLOR);
    }
    if (hoveredPixel) {
      drawPixel(canvasHelperCtx, hoveredPixel, currentPixelColor);
    }
    if (changedPixels) {
      const color = isPendingTransaction ? PENDING_COLOR : CHANGED_COLOR;
      changedPixels.forEach((changedPixel) => {
        const colorByIndex = getColorByIndex(changedPixel.newColor);
        drawPixel(canvasHelperCtx, changedPixel.coordinates, colorByIndex);
        highlightPixel(canvasHelperCtx, changedPixel.coordinates, color);
      });
    }
    return () => {
      highlightedPixel && clearPixel(canvasHelperCtx, highlightedPixel.pixelCoordinates);
      hoveredPixel && clearPixel(canvasHelperCtx, hoveredPixel);
      changedPixels.forEach((changedPixel) => clearPixel(canvasHelperCtx, changedPixel.coordinates))
    }
  }, [hoveredPixel, highlightedPixel, currentPixelColor, changedPixels, isPendingTransaction, zoomingState, canvasHelperCtx]);
}