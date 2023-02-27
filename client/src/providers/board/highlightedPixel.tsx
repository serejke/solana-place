import * as React from "react";
import { HighlightedPixel } from "../../model/highlightedPixel";

type SetState = React.Dispatch<
  React.SetStateAction<HighlightedPixel | undefined>
>;
type State = [HighlightedPixel | undefined, SetState];
const Context = React.createContext<State | undefined>(undefined);

export function HighlightedPixelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state: State = React.useState<HighlightedPixel | undefined>(undefined);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useHighlightedPixel(): HighlightedPixel | undefined {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(
      `useHighlightedPixel must be used within a HighlightedPixelProvider`
    );
  }
  return state[0];
}

export function useHighlightPixel(): SetState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(
      `useHighlightedPixel must be used within a HighlightedPixelProvider`
    );
  }
  return state[1];
}
