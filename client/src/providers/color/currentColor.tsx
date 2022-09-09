import * as React from "react";
import {getColorByIndex, PixelColor} from "utils/colorUtils";

type SetState = React.Dispatch<React.SetStateAction<PixelColor>>;
type State = [PixelColor, SetState];
const Context = React.createContext<State | undefined>(undefined);

const DEFAULT_PIXEL_COLOR: PixelColor = getColorByIndex(4)!;

export function CurrentColorProvider({children}: { children: React.ReactNode }) {
  const state: State = React.useState<PixelColor>(DEFAULT_PIXEL_COLOR);
  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
}

export function useCurrentPixelColorState(): [PixelColor, SetState] {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useCurrentPixelColorState must be used within a PixelColorProvider`);
  }
  return state;
}