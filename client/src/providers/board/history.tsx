import * as React from "react";
import {BoardHistory} from "./model";
import {useState} from "react";
import {fetchBoardHistory} from "../server/cluster/request";
import {useServerConfig} from "../server/serverConfig";
import {useBoardState} from "./board";

type BoardHistoryState = {
  boardHistory?: BoardHistory
}

const BoardHistoryContext = React.createContext<BoardHistoryState>({});

type ProviderProps = { children: React.ReactNode };

export function BoardHistoryProvider({children}: ProviderProps) {
  const [boardHistory, setBoardHistory] = useState<BoardHistory>();
  const serverConfig = useServerConfig();
  const boardState = useBoardState();
  React.useEffect(() => {
    fetchBoardHistory(serverConfig.httpUrl)
      .then(boardHistoryDto => setBoardHistory(boardHistoryDto));
  }, [serverConfig.httpUrl, setBoardHistory, boardState])
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
