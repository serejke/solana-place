import * as React from "react";
import {useState} from "react";

import {LoadingModal} from "components/LoadingModal";
import {GameCanvas} from "./components/GameCanvas";
import {PixelColorPicker, SelectedPixel} from "./components/PixelColorPicker";
import {Dashboard} from "components/Dashboard";
import {parseGameEventWithTransactionDetailsFromDto} from "./dto-converter/converter";
import {useAddSocketMessageHandler} from "./providers/server/webSocket";
import {useBoardDispatch} from "./providers/board/boardState";
import {useBoardHistoryDispatch} from "./providers/board/boardHistory";
import {fetchBoard} from "./request/fetchBoard";
import {serverUrl} from "./request/serverUrls";
import {fetchBoardHistory} from "./request/fetchBoardHistory";
import {areEqual} from "./model/boardState";
import {AboutModal} from "./components/AboutModal";
import {GameEventWithTransactionDetails} from "./model/model";
import {BoardStateDispatch} from "./reducers/boardStateReducer";
import {BoardHistoryDispatch} from "./reducers/boardHistoryReducer";

export default function App() {
  const [selectedPixel, setSelectedPixel] = useState<SelectedPixel>();

  useRequestInitialBoardState();
  useRequestInitialBoardHistory();
  useSubscribeToBoardEvents();

  return (
    <div className="main-content">
      <GameCanvas onPixelClicked={(pixel) => {
        if (selectedPixel && areEqual(selectedPixel.pixelCoordinates, pixel.pixelCoordinates)) {
          setSelectedPixel(undefined);
        } else {
          setSelectedPixel(pixel)
        }
      }}/>
      <Dashboard onMouseDown={() => setSelectedPixel(undefined)}/>
      <PixelColorPicker selectedPixel={selectedPixel} close={() => setSelectedPixel(undefined)}/>
      <LoadingModal/>
      <AboutModal/>
    </div>
  );
}

function useRequestInitialBoardState() {
  const boardDispatch = useBoardDispatch();

  React.useEffect(() => {
    fetchBoard(serverUrl)
      .then(boardStateDto => {
        boardDispatch({
          type: "initialState",
          newState: {
            ...boardStateDto,
            changed: [],
            pendingTransaction: null,
            pendingTransactionIntervalId: null
          }
        })
      });
  }, [boardDispatch]);
}

function useRequestInitialBoardHistory() {
  const boardHistoryDispatch = useBoardHistoryDispatch();

  React.useEffect(() => {
    fetchBoardHistory(serverUrl)
      .then(boardHistory => {
        boardHistoryDispatch({
          type: "initialHistory",
          history: boardHistory
        })
      });
  }, [boardHistoryDispatch])
}

function useSubscribeToBoardEvents() {
  const boardDispatch = useBoardDispatch();
  const boardHistoryDispatch = useBoardHistoryDispatch();

  // Subscribe to pixel updates via web-socket.
  const messageHandler = React.useCallback((message: any) => {
    const gameEventsWithTransactionDetails = parseGameEventWithTransactionDetailsFromDto(message);
    if (gameEventsWithTransactionDetails) {
      console.log("Received event", message);
      updateBoardStateAndHistory(gameEventsWithTransactionDetails, boardDispatch, boardHistoryDispatch);
    }
  }, [boardDispatch, boardHistoryDispatch]);

  useAddSocketMessageHandler(messageHandler);
}

export function updateBoardStateAndHistory(
  gameEventsWithTransactionDetails: GameEventWithTransactionDetails[],
  boardDispatch: BoardStateDispatch,
  boardHistoryDispatch: BoardHistoryDispatch
) {
  const pixelChangedEvents = gameEventsWithTransactionDetails
    .filter(({event}) => event.type === "pixelChangedEvent");
  if (pixelChangedEvents.length > 0) {
    boardDispatch({
      type: "updatePixels",
      updatedPixels: pixelChangedEvents
        .map(({event}) => ({
          coordinates: {row: event.row, column: event.column},
          newColor: event.newColor
        }))
    })
    boardHistoryDispatch({
      type: "addHistoryEntries",
      gameEventsWithTransactionDetails
    })
  }
}