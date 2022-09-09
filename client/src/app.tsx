import * as React from "react";
import {useState} from "react";

import {LoadingModal} from "components/LoadingModal";
import {GameCanvas} from "./components/canvas/GameCanvas";
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
import {Notifications} from "components/Notifications";
import {
  createTransactionConfirmedNotification,
  useSetAndUnsetPendingTransaction
} from "./providers/transactions/pendingTransaction";
import {useAddNotification} from "./providers/notifications/notifications";
import {ZoomingStateProvider} from "./providers/zooming/zooming";

export default function App() {
  const [selectedPixel, setSelectedPixel] = useState<SelectedPixel>();

  useRequestInitialBoardState();
  useRequestInitialBoardHistory();
  useSubscribeToBoardEvents();

  const onPixelClicked = React.useCallback((pixel: SelectedPixel) => {
    if (selectedPixel && areEqual(selectedPixel.pixelCoordinates, pixel.pixelCoordinates)) {
      setSelectedPixel(undefined);
    } else {
      setSelectedPixel(pixel)
    }
  }, [selectedPixel]);

  return (
    <div className="main-content">
      <ZoomingStateProvider>
        <GameCanvas onPixelClicked={onPixelClicked}/>
        <Dashboard onMouseDown={() => setSelectedPixel(undefined)}/>
      </ZoomingStateProvider>
      <PixelColorPicker selectedPixel={selectedPixel} close={() => setSelectedPixel(undefined)}/>
      <LoadingModal/>
      <AboutModal/>
      <Notifications/>
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
          newState: {...boardStateDto}
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
  const addNotification = useAddNotification();
  const {unsetPendingTransaction} = useSetAndUnsetPendingTransaction();

  // Subscribe to pixel updates via web-socket.
  const messageHandler = React.useCallback(async (message: any) => {
    const gameEventWithTransactionDetails = parseGameEventWithTransactionDetailsFromDto(message);
    if (gameEventWithTransactionDetails) {
      updateBoardStateAndHistory(gameEventWithTransactionDetails, boardDispatch, boardHistoryDispatch);
      const transactionSignature = gameEventWithTransactionDetails.transactionDetails.signature;
      if (await unsetPendingTransaction(transactionSignature, true)) {
        addNotification(createTransactionConfirmedNotification())
      }
    }
  }, [boardDispatch, boardHistoryDispatch, unsetPendingTransaction, addNotification]);

  useAddSocketMessageHandler(messageHandler);
}

export function updateBoardStateAndHistory(
  gameEventWithTransactionDetails: GameEventWithTransactionDetails,
  boardDispatch: BoardStateDispatch,
  boardHistoryDispatch: BoardHistoryDispatch
) {
  if (gameEventWithTransactionDetails.event.type !== "pixelsChangedEvent") {
    return;
  }
  boardDispatch({
    type: "updatePixels",
    updatedPixels: gameEventWithTransactionDetails.event.changes
      .map(({row, column, newColor}) => ({
        coordinates: {row, column},
        newColor: newColor
      })),
    transactionDetails: gameEventWithTransactionDetails.transactionDetails
  })
  boardHistoryDispatch({
    type: "addHistoryEntry",
    gameEventWithTransactionDetails: gameEventWithTransactionDetails
  })
}