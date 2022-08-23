import * as React from "react";
import {serverUrl} from "../server/server-config";
import {BoardDispatch, boardStateReducer} from "./reducer";
import {BoardState} from "./state";
import {useSocketMessageHandlers} from "../server/socket";
import {PixelChangedEventDto} from "../server/dto/dto";
import {HighlightedPixelProvider} from "./highlighter";
import {fetchBoard} from "../server/request/fetchBoard";

const StateContext = React.createContext<BoardState | undefined>(undefined);
const DispatchContext = React.createContext<BoardDispatch | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function BoardStateProvider({children}: ProviderProps) {
  const [boardState, boardDispatch] = React.useReducer(boardStateReducer, {height: 0, width: 0, colors: [], changed: []});
  const [, setSocketMessageHandlers] = useSocketMessageHandlers();

  // Initial request.
  React.useEffect(() => {
    fetchBoard(serverUrl)
      .then(boardStateDto => {
        boardDispatch({
          type: "initialState",
          newState: {...boardStateDto, changed: []}
        })
      });
  }, []);

  // Subscribe to pixel updates via web-socket.
  React.useEffect(() => {
    setSocketMessageHandlers((handler) => [
      ...handler,
      (data) => {
        if ("type" in data && data["type"] === "pixelChangedEvent") {
          const pixelChangedEventDto: PixelChangedEventDto = data.pixelChangedEvent;
          boardDispatch({
            type: "updateSinglePixel",
            coordinates: { row: pixelChangedEventDto.row, column: pixelChangedEventDto.column },
            newColor: pixelChangedEventDto.newColor
          });
        }
      }
    ])
  }, [setSocketMessageHandlers])

  return (
    <StateContext.Provider value={boardState}>
      <DispatchContext.Provider value={boardDispatch}>
        <HighlightedPixelProvider>
          {children}
        </HighlightedPixelProvider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useBoardDispatch(): BoardDispatch {
  const dispatch = React.useContext(DispatchContext);
  if (!dispatch) {
    throw new Error(`useDispatch must be used within a BoardStateProvider`);
  }

  return dispatch;
}

export function useBoardState(): BoardState | undefined {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(`useBoardState must be used within a BoardStateProvider`);
  }
  return state;
}

