import * as React from "react";
import {useReducer} from "react";
import {BoardHistory} from "../../model/model";
import {BoardHistoryAction, BoardHistoryDispatch, boardHistoryReducer} from "../../reducers/boardHistoryReducer";

type SetState = React.Dispatch<BoardHistoryAction>;
type State = [BoardHistory | undefined, SetState]
const Context = React.createContext<State | undefined>(undefined);

export function BoardHistoryProvider({children}: { children: React.ReactNode }) {
  const [boardHistory, boardHistoryDispatch]: [BoardHistory, SetState] = useReducer(boardHistoryReducer, {events: []});

  return (
    <Context.Provider value={[boardHistory, boardHistoryDispatch]}>
      {children}
    </Context.Provider>
  )
}

export function useBoardHistory(): BoardHistory | undefined {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useBoardHistory must be used within a BoardHistoryProvider`);
  }
  return state[0];
}

export function useBoardHistoryDispatch(): BoardHistoryDispatch {
  const dispatch = React.useContext(Context);
  if (!dispatch) {
    throw new Error(`useBoardHistoryDispatch must be used within a BoardHistoryProvider`);
  }
  return dispatch[1];
}
