import * as React from "react";
import {PixelCoordinates} from "./state";

type HighlightedPixel = {
  pixelCoordinates: PixelCoordinates,
}
type SetHighlightedPixel = React.Dispatch<React.SetStateAction<HighlightedPixel | undefined>>;
type HighlightedState = [HighlightedPixel | undefined, SetHighlightedPixel];
export const Context = React.createContext<HighlightedState | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function HighlightedPixelProvider({children}: ProviderProps) {
  const state: HighlightedState = React.useState<HighlightedPixel | undefined>(undefined);
  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
}

export function useHighlightedPixel(): HighlightedPixel | undefined {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useHighlightedPixel must be used within a HighlightedPixelProvider`);
  }
  return state[0];
}

export function useHighlightPixel(): SetHighlightedPixel {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useHighlightedPixel must be used within a HighlightedPixelProvider`);
  }
  return state[1];
}
