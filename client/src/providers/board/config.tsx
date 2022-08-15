import * as React from "react";

type BoardConfig = {
  showGrid: boolean
}
type SetBoardConfig = React.Dispatch<React.SetStateAction<BoardConfig>>;
type State = [BoardConfig, SetBoardConfig];
export const Context = React.createContext<State | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function BoardConfigProvider({children}: ProviderProps) {
  const initialState = {showGrid: true};
  const state: State = React.useState<BoardConfig>(initialState);
  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
}

export function useBoardConfig(): BoardConfig {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useBoardConfig must be used within a BoardConfigProvider`);
  }
  return state[0];
}

export function useSetBoardConfig(): SetBoardConfig {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useSetBoardConfig must be used within a BoardConfigProvider`);
  }
  return state[1];
}