import * as React from "react";
import { BoardConfig } from "../../model/boardConfig";
import { useIsPhone } from "../../utils/mobile";

type SetState = React.Dispatch<React.SetStateAction<BoardConfig>>;
type State = [BoardConfig, SetState];
const Context = React.createContext<State | undefined>(undefined);

export function BoardConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isPhone = useIsPhone();
  const state: State = React.useState<BoardConfig>({
    showGrid: !isPhone,
    showHistory: !isPhone,
    isHighlightChangedPixels: false,
  });
  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useBoardConfig(): BoardConfig {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useBoardConfig must be used within a BoardConfigProvider`);
  }
  return state[0];
}

export function useSetBoardConfig(): SetState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(
      `useSetBoardConfig must be used within a BoardConfigProvider`
    );
  }
  return state[1];
}
