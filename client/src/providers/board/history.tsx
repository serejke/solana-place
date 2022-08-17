import * as React from "react";
import {BoardHistory} from "./model";
import {useState} from "react";
import {useServerConfig} from "../server/serverConfig";
import {useBoardState} from "./board";
import {fetchBoardHistory} from "../server/request/fetchBoard";
import {useThrottle } from "@react-hook/throttle";

type BoardHistoryState = {
  boardHistory?: BoardHistory
}

const BoardHistoryContext = React.createContext<BoardHistoryState>({});

type ProviderProps = { children: React.ReactNode };

export function BoardHistoryProvider({children}: ProviderProps) {
  const [boardHistory, setBoardHistory] = useState<BoardHistory>();
  const serverConfig = useServerConfig();
  const boardState = useBoardState();

  const [throttledBoardState, setThrottledBoardState] = useThrottle(boardState, 1);
  React.useEffect(() => {
    setThrottledBoardState(boardState);
  }, [boardState, setThrottledBoardState]);

  React.useEffect(() => {
    fetchBoardHistory(serverConfig.httpUrl)
      .then(boardHistoryDto => setBoardHistory(boardHistoryDto));
  }, [serverConfig.httpUrl, setBoardHistory, throttledBoardState])
  return (
    <BoardHistoryContext.Provider value={{boardHistory}}>
      {children}
    </BoardHistoryContext.Provider>
  )
}

export function useBoardHistory(): BoardHistory | undefined {
  const boardHistory = React.useContext(BoardHistoryContext);
  if (!boardHistory) {
    throw new Error(`useDispatch must be used within a BoardHistoryProvider`);
  }
  return boardHistory.boardHistory;
}
