import * as React from "react";
import {BoardStateDispatch, boardStateReducer} from "../../reducers/boardStateReducer";
import {BoardState} from "../../model/boardState";
import {HighlightedPixelProvider} from "./highlightedPixel";

const Context = React.createContext<BoardState | undefined>(undefined);
const DispatchContext = React.createContext<BoardStateDispatch | undefined>(undefined);

export function BoardStateProvider({children}: { children: React.ReactNode }) {
  const [boardState, boardDispatch] = React.useReducer(boardStateReducer, {
    height: 0,
    width: 0,
    colors: []
  });

  return (
    <Context.Provider value={boardState}>
      <DispatchContext.Provider value={boardDispatch}>
        <HighlightedPixelProvider>
          {children}
        </HighlightedPixelProvider>
      </DispatchContext.Provider>
    </Context.Provider>
  );
}

export function useBoardDispatch(): BoardStateDispatch {
  const dispatch = React.useContext(DispatchContext);
  if (!dispatch) {
    throw new Error(`useDispatch must be used within a BoardStateProvider`);
  }

  return dispatch;
}

export function useBoardState(): BoardState | undefined {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useBoardState must be used within a BoardStateProvider`);
  }
  if (state.height === 0) {
    return undefined;
  }
  return state;
}

