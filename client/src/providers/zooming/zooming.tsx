import React, {useReducer} from "react";
import {CanvasPosition, CanvasSize, CanvasStyle, ClientPositionInCanvas} from "../../components/canvas/types";

export type ZoomingState = {
  canvasSize: CanvasSize,
  canvasStyle: CanvasStyle,
  zoom: number,
  zoomPivot: ZoomPivot,
  canvasTranslateX: number,
  canvasTranslateY: number
}

const ZERO_ZOOM_PIVOT: ZoomPivot = {x: 0, y: 0, clientX: 0, clientY: 0}

type CanvasInstalledAction = {
  "type": "canvasInstalled",
  canvasSize: CanvasSize,
  canvasStyle: CanvasStyle
}

type ZoomInOurOutAction = {
  "type": "zoom",
  pivot: ZoomPivot,
  inOurOut: "in" | "out"
}

type ZoomingAction = CanvasInstalledAction | ZoomInOurOutAction;

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

type State = [ZoomingState, React.Dispatch<ZoomingAction>];
const Context = React.createContext<State | undefined>(undefined);

const DEFAULT_ZOOMING_STATE: ZoomingState = {
  zoom: 1.0,
  canvasSize: {height: 0, width: 0},
  canvasStyle: {height: 0, width: 0},
  canvasTranslateX: 0,
  canvasTranslateY: 0,
  zoomPivot: ZERO_ZOOM_PIVOT,
};

export function ZoomingStateProvider({children}: { children: React.ReactNode }) {
  const [zoomingState, zoomingDispatch] = useReducer(zoomingReducer, DEFAULT_ZOOMING_STATE);
  return (
    <Context.Provider value={[zoomingState, zoomingDispatch]}>
      {children}
    </Context.Provider>
  );
}

export function useZooming(): [ZoomingState, React.Dispatch<ZoomingAction>] {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useZooming must be used within a ZoomingStateProvider`);
  }
  return state;
}

export type ZoomPivot = CanvasPosition & ClientPositionInCanvas;
const ZOOMING_OPTIONS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8];