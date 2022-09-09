import {useBoardState} from "../../providers/board/boardState";
import React, {MutableRefObject, useRef, useState} from "react";
import {CHANGED_COLOR, getColorByIndex, HIGHLIGHTED_COLOR, PENDING_COLOR} from "../../utils/colorUtils";
import {useBoardConfig} from "../../providers/board/boardConfig";
import {BoardState, isWithinBounds} from "../../model/boardState";
import {useHighlightedPixel} from "../../providers/board/highlightedPixel";
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
import {useColorPickerStateAndActions} from "../../providers/color/colorPicker";
import {useChangeOrCancelPixel} from "./useChangeOrCancelPixel";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);

  const boardState = useBoardState();
  const {showGrid, isHighlightChangedPixels} = useBoardConfig();
  const [zoomingState, zoomingDispatch] = useZooming();

  const [hoveredPixel, setHoveredPixel] = useState<PixelCoordinates>();
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const {pendingTransaction} = usePendingTransaction();
  const isPendingTransaction = pendingTransaction !== null;

  const {openColorPicker, closeColorPicker} = useColorPickerStateAndActions();
  const changeOrCancelPixel = useChangeOrCancelPixel();

  // Used for optimization.
  const currentBoardState = useRef<BoardState>();
  React.useEffect(() => {
    // Drop the board cache to force the re-paint.
    currentBoardState.current = undefined;
  }, [zoomingState]);

  useCanvasResizeEffect([canvasRef, canvasGridRef, canvasHelperRef]);
  useDrawBoardEffect(canvasRef, currentBoardState);
  useDrawGridEffect(canvasGridRef);
  useDrawHoveredAndHighlightedAndChangedPixelsEffect(canvasHelperRef, hoveredPixel, isHighlightChangedPixels);

  const onOpenColorPickerCallback: CanvasCallback = React.useCallback(({canvasPosition, event}) => {
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (!boardState || !isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) return;
    openColorPicker({
      pixelCoordinates,
      popupPosition: {
        clientX: event.clientX,
        clientY: event.clientY
      }
    })
  }, [boardState, openColorPicker]);

  const onMouseMoveCallback: CanvasCallback = React.useCallback(({canvasPosition}) => {
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (!boardState || !isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) return;
    if (!isDrawingMode || isPendingTransaction) {
      setHoveredPixel(pixelCoordinates);
      return;
    }
    changeOrCancelPixel(pixelCoordinates, isDrawingMode);
  }, [
    boardState,
    setHoveredPixel,
    isDrawingMode,
    isPendingTransaction,
    changeOrCancelPixel
  ]);

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

  const onMouseDownCallback: CanvasCallback = React.useCallback(({canvasPosition}) => {
    closeColorPicker();
    const pixelCoordinates = getPixelCoordinates(canvasPosition);
    if (!boardState || !isWithinBounds(boardState, pixelCoordinates.row, pixelCoordinates.column)) return;
    changeOrCancelPixel(pixelCoordinates, false);
    setIsDrawingMode(true);
  }, [setIsDrawingMode, boardState, changeOrCancelPixel, closeColorPicker]);

  const onZoomKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Equal" || e.code === "Plus") {
      zoomInOrOut("in");
    } else if (e.code === "Minus") {
      zoomInOrOut("out");
    }
  }, [zoomInOrOut]);

  const onDoubleClick = useCanvasCallback(onOpenColorPickerCallback, zoomingState);
  const onContextMenu = useCanvasCallback(onOpenColorPickerCallback, zoomingState);
  const onMouseMove = useCanvasCallback(onMouseMoveCallback, zoomingState);
  const onMouseWheel = useCanvasCallback(onMouseWheelCallback, zoomingState);
  const onMouseDown = useCanvasCallback(onMouseDownCallback, zoomingState);
  const onMouseUp = React.useCallback(() => {
    setIsDrawingMode(false);
  }, [setIsDrawingMode]);

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
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
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
  const isCanvasSet = canvasRef.current !== null;
  return React.useMemo(() => {
    return canvasRef.current?.getContext("2d")!;
    // Do not depend on the HTMLCanvasElement.
    //  eslint-disable-next-line
  }, [isCanvasSet])
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
  hoveredPixel: PixelCoordinates | undefined,
  isHighlightChangedPixels: boolean
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
    if (changedPixels) {
      changedPixels.forEach((changedPixel) => {
        const colorByIndex = getColorByIndex(changedPixel.newColor);
        drawPixel(canvasHelperCtx, changedPixel.coordinates, colorByIndex);
        if (isPendingTransaction || isHighlightChangedPixels) {
          highlightPixel(canvasHelperCtx, changedPixel.coordinates, isPendingTransaction ? PENDING_COLOR : CHANGED_COLOR);
        }
      });
    }
    if (hoveredPixel) {
      drawPixel(canvasHelperCtx, hoveredPixel, currentPixelColor);
    }
    return () => {
      highlightedPixel && clearPixel(canvasHelperCtx, highlightedPixel.pixelCoordinates);
      hoveredPixel && clearPixel(canvasHelperCtx, hoveredPixel);
      changedPixels.forEach((changedPixel) => clearPixel(canvasHelperCtx, changedPixel.coordinates))
    }
  }, [
    hoveredPixel,
    highlightedPixel,
    currentPixelColor,
    changedPixels,
    isPendingTransaction,
    zoomingState,
    isHighlightChangedPixels,
    canvasHelperCtx,
  ]);
}