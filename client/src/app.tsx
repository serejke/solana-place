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
    const gameEventsWithTransactionDetails = parseGameEventWithTransactionDetailsFromDto(message);
    if (gameEventsWithTransactionDetails) {
      for (const {event, transactionDetails} of gameEventsWithTransactionDetails) {
        console.log("Received event", transactionDetails.confirmation, event, transactionDetails);
        if (event.type === "pixelChangedEvent") {
          boardDispatch({
            type: "updateSinglePixel",
            coordinates: {row: event.row, column: event.column},
            newColor: event.newColor
          });
        }
        boardHistoryDispatch({
          type: "addHistoryEntry",
          gameEventWithTransactionDetails: {event, transactionDetails}
        })
      }
    }
  }, [boardDispatch, boardHistoryDispatch]);

  useAddSocketMessageHandler(messageHandler);
}