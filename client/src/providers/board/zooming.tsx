import * as React from "react";
import {useCallback, useRef, useState} from "react";
import {CanvasPosition} from "../../model/canvasPosition";
import {PIXEL_SIZE} from "../../components/GameCanvas";

export type ZoomingState = {
  zoom: number,
  zoomPivot: ZoomPivot,
  dpr: number,
  canvasTranslateX: number,
  canvasTranslateY: number,
  zoomIn: (pivot: ZoomPivot) => void,
  zoomOut: (pivot: ZoomPivot) => void,
  onZoomUpdated: () => void
}

const Context = React.createContext<ZoomingState | undefined>(undefined);

const ZERO_ZOOM_PIVOT: ZoomPivot = {x: 0, y: 0, clientX: 0, clientY: 0}

export function ZoomingProvider({children}: { children: React.ReactNode }) {
  const dpr = window.devicePixelRatio;
  const [zoom, setZoom] = useState<number>(1);
  const [zoomPivot, setZoomPivot] = useState<ZoomPivot>(ZERO_ZOOM_PIVOT);
  const isUpdatingRef = useRef<boolean>(false);

  /*
    When the pivot is close to the left or top border we don't want to lose the very beginning pixels.
    We want them to stick on the borders, thus make the pivot's corresponding coordinate 0 in this case.
   */
  function stickPivotToBeginning(pivot: ZoomPivot): ZoomPivot {
    const threshold = 25;
    const { x, clientX } = pivot.x > threshold * PIXEL_SIZE ? { ...pivot } : { x: 0, clientX: 0 };
    const { y, clientY } = pivot.y > threshold * PIXEL_SIZE ? { ...pivot } : { y: 0, clientY: 0 };
    return { x, y, clientX, clientY};
  }

  const zoomInOrOut = useCallback((pivot: ZoomPivot, inOrOut: boolean) => {
    if (isUpdatingRef.current) {
      return;
    }
    const index = ZOOMING_OPTIONS.indexOf(zoom);
    let newZoom = zoom;
    if (inOrOut && index < ZOOMING_OPTIONS.length - 1) {
      newZoom = ZOOMING_OPTIONS[index + 1];
    } else if (!inOrOut && index > 0) {
      newZoom = ZOOMING_OPTIONS[index - 1];
    }
    if (newZoom !== zoom) {
      const newZoomPivot = newZoom < 1 ? ZERO_ZOOM_PIVOT : stickPivotToBeginning(pivot);
      isUpdatingRef.current = true;
      setZoom(newZoom);
      setZoomPivot(newZoomPivot);
    }
  }, [zoom]);
  const zoomIn = useCallback((pivot: ZoomPivot) => zoomInOrOut(pivot, true), [zoomInOrOut]);
  const zoomOut = useCallback((pivot: ZoomPivot) => zoomInOrOut(pivot, false), [zoomInOrOut]);
  const onZoomUpdated = useCallback(() => isUpdatingRef.current = false, []);

  const state: ZoomingState = React.useMemo(() => {
    const scale = dpr * zoom;
    const canvasTranslateX = -Math.max(0, zoomPivot.x * scale - dpr * zoomPivot.clientX);
    const canvasTranslateY = -Math.max(0, zoomPivot.y * scale - dpr * zoomPivot.clientY);
    return {
      zoomPivot,
      dpr,
      canvasTranslateX,
      canvasTranslateY,
      zoom,
      zoomIn,
      zoomOut,
      onZoomUpdated
    };
  }, [zoomPivot, dpr, zoom, zoomIn, zoomOut, onZoomUpdated])

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
}

export function useZooming(): ZoomingState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useBoardConfig must be used within a BoardConfigProvider`);
  }
  return state;
}

export type ClientPosition = { clientX: number, clientY: number };
export type ZoomPivot = CanvasPosition & ClientPosition;

const ZOOMING_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5];