import * as React from "react";
import {SelectedPixelProvider} from "./selected";
import {useServerConfig} from "../server/serverConfig";
import {fetchBoard} from "../server/cluster/request";
import {BoardDispatch, boardStateReducer} from "./reducer";
import {BoardState} from "./state";
import {useSocketMessageHandlers} from "../server/socket";
import {PixelChangedEventDto} from "../server/dto/dto";
import {HighlightedPixelProvider} from "./highlighter";

const StateContext = React.createContext<BoardState | undefined>(undefined);
const DispatchContext = React.createContext<BoardDispatch | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function BoardStateProvider({children}: ProviderProps) {
  const [boardState, boardDispatch] = React.useReducer(boardStateReducer, {height: 0, width: 0, colors: [], changed: []});
  const serverConfig = useServerConfig();
  const [, setSocketMessageHandlers] = useSocketMessageHandlers();

  // Initial request.
  React.useEffect(() => {
    fetchBoard(serverConfig.httpUrl)
      .then(boardStateDto => {
        boardDispatch({
          type: "initialState",
          newState: {...boardStateDto, changed: []}
        })
      });
  }, [serverConfig.httpUrl]);

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
        <SelectedPixelProvider>
          <HighlightedPixelProvider>
            {children}
          </HighlightedPixelProvider>
        </SelectedPixelProvider>
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
  if (state.height === 0) {
    return undefined;
  }
  return state;
}

