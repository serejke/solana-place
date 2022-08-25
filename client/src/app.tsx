import * as React from "react";

import {LoadingModal} from "components/LoadingModal";
import {useGameState} from "providers/gameState";
import {GameCanvas} from "./components/GameCanvas";
import {PixelColorPicker, SelectedPixel} from "./components/PixelColorPicker";
import {Dashboard} from "components/Dashboard";
import {useState} from "react";
import {parseEventWithTransactionDetailsDtoFromSocketMessage} from "./dto-converter/converter";
import {useAddSocketMessageHandler} from "./providers/server/webSocket";
import {useBoardDispatch} from "./providers/board/boardState";
import {useBoardHistoryDispatch} from "./providers/board/boardHistory";
import {fetchBoard} from "./request/fetchBoard";
import {serverUrl} from "./request/serverUrls";
import {fetchBoardHistory} from "./request/fetchBoardHistory";
import {areEqual} from "./model/boardState";

export default function App() {
  const gameState = useGameState();
  const showLoadingModal = gameState.loadingPhase !== "complete";
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
      <LoadingModal show={showLoadingModal} phase={gameState.loadingPhase}/>
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
          newState: {...boardStateDto, changed: []}
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
    const eventWithTransactionDetails = parseEventWithTransactionDetailsDtoFromSocketMessage(message);
    if (eventWithTransactionDetails) {
      const event = eventWithTransactionDetails.event;
      console.log("Received event", eventWithTransactionDetails.transactionDetails.confirmation, event, eventWithTransactionDetails.transactionDetails);
      if (event.type === "pixelChangedEvent") {
        boardDispatch({
          type: "updateSinglePixel",
          coordinates: {row: event.row, column: event.column},
          newColor: event.newColor
        });
      }
      boardHistoryDispatch({
        type: "addHistoryEntry",
        eventWithTransactionDetails
      })
    }
  }, [boardDispatch, boardHistoryDispatch]);

  useAddSocketMessageHandler(messageHandler);
}