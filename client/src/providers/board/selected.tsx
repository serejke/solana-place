import * as React from "react";
import {CanvasPosition} from "../../components/GameCanvas";
import {PixelCoordinates} from "./state";

type SelectedPixel = {
  pixelCoordinates: PixelCoordinates,
  canvasPosition: CanvasPosition
}
type SetSelected = React.Dispatch<React.SetStateAction<SelectedPixel | undefined>>;
type SelectedState = [SelectedPixel | undefined, SetSelected];
export const Context = React.createContext<SelectedState | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function SelectedPixelProvider({children}: ProviderProps) {
  const selectedState: SelectedState = React.useState<SelectedPixel | undefined>(undefined);
  return (
    <Context.Provider value={selectedState}>
      {children}
    </Context.Provider>
  );
}

export function useSelectedPixel() {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useSelectedPixel must be used within a SelectedPixelProvider`);
  }
  return state[0];
}

export function useSelectPixel() {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useSelectedPixel must be used within a SelectedPixelProvider`);
  }
  return state[1];
}
