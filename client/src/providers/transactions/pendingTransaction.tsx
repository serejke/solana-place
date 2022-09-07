import * as React from "react";
import {useState} from "react";
import {useBoardDispatch} from "../board/boardState";
import {TransactionSignature} from "@solana/web3.js";
import {fetchTransactionEvents} from "../../request/fetchTransactionEvents";
import {useBoardHistoryDispatch} from "../board/boardHistory";
import {updateBoardStateAndHistory} from "../../app";
import {useAddNotification} from "../notifications/notifications";
import {buildSuccessNotification, buildWarnNotification} from "../../model/notification";
import {BoardStateDispatch} from "../../reducers/boardStateReducer";
import {BoardHistoryDispatch} from "../../reducers/boardHistoryReducer";
import {ChangedPixel} from "../../model/changedPixel";
import {areEqual} from "../../model/boardState";
import {PixelCoordinates} from "../../model/pixelCoordinates";

const PENDING_TRANSACTION_PROCESSING_INTERVAL = 5000;
const PENDING_TRANSACTION_TIMEOUT = 90000;

type SetAndUnsetPendingTransaction = {
  setPendingTransaction: (pendingTransaction: TransactionSignature) => void;
  unsetPendingTransaction: (transactionSignature: TransactionSignature, clearChangedPixels: boolean) => Promise<boolean>;
}

type State = {
  changedPixels: ChangedPixel[],
  pendingTransaction: TransactionSignature | null,
  pendingTransactionIntervalId: number | null;
};

type SetState = React.Dispatch<React.SetStateAction<State>>;

const DEFAULT_STATE: State = {
  changedPixels: [],
  pendingTransaction: null,
  pendingTransactionIntervalId: null
};
const Context = React.createContext<[State, SetState] | undefined>(undefined);

export function PendingTransactionProvider({children}: { children: React.ReactNode }) {
  const [pendingTransaction, setPendingTransaction] = useState(DEFAULT_STATE);
  return (
    <Context.Provider value={[pendingTransaction, setPendingTransaction]}>
      {children}
    </Context.Provider>
  );
}

export function usePendingTransaction(): State {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(`usePendingTransaction must be used within a PendingTransactionProvider`);
  }
  return context[0];
}

function useSetPendingTransactionState(): SetState {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(`useSetPendingTransaction must be used within a PendingTransactionProvider`);
  }
  return context[1];
}

type AddOrDeleteChangedPixel = {
  addChangedPixel: (changedPixel: ChangedPixel) => void;
  deleteChangedPixel: (pixelCoordinates: PixelCoordinates) => void;
}

export function useAddOrDeleteChangedPixel(): AddOrDeleteChangedPixel {
  const setPendingTransactionState = useSetPendingTransactionState();
  const addChangedPixel = React.useCallback((changedPixel: ChangedPixel) => {
    setPendingTransactionState(state => {
      const coordinates = changedPixel.coordinates;
      const index = state.changedPixels.findIndex((pixel) => areEqual(coordinates, pixel.coordinates))
      let newChangedPixels;
      if (index < 0) {
        newChangedPixels = [...state.changedPixels, changedPixel]
      } else {
        newChangedPixels = state.changedPixels.map((pixel) =>
          areEqual(pixel.coordinates, coordinates) ? changedPixel : pixel
        );
      }
      return {
        ...state,
        changedPixels: newChangedPixels
      };
    });
  }, [setPendingTransactionState]);
  const deleteChangedPixel = React.useCallback((pixelCoordinates: PixelCoordinates) => {
    setPendingTransactionState((state) => ({
      ...state,
      changedPixels: state.changedPixels.filter(changed => !areEqual(changed.coordinates, pixelCoordinates))
    }))
  }, [setPendingTransactionState]);
  return {
    addChangedPixel,
    deleteChangedPixel
  }
}

export function useSetAndUnsetPendingTransaction(): SetAndUnsetPendingTransaction {
  const setPendingTransactionState = useSetPendingTransactionState();
  const boardDispatch = useBoardDispatch();
  const boardHistoryDispatch = useBoardHistoryDispatch();
  const addNotification = useAddNotification();

  const unsetPendingTransaction = React.useCallback((transactionSignature: TransactionSignature, clearChangedPixels: boolean) => {
    return new Promise<boolean>((resolve) => {
      setPendingTransactionState(state => {
        if (state.pendingTransaction !== transactionSignature) {
          resolve(false);
          return state;
        }
        resolve(true);
        if (state.pendingTransactionIntervalId) {
          clearInterval(state.pendingTransactionIntervalId);
        }
        return {
          ...state,
          changedPixels: clearChangedPixels ? [] : state.changedPixels,
          pendingTransaction: null,
          pendingTransactionIntervalId: null
        };
      })
    });
  }, [setPendingTransactionState]);

  const setPendingTransaction = React.useCallback((pendingTransaction: TransactionSignature) => {
    const sentAt = Date.now();

    const pendingTransactionIntervalId = window.setInterval(async () => {
        const processResult = await processPendingTransaction(
          pendingTransaction,
          sentAt,
          boardDispatch,
          boardHistoryDispatch
        );
        if (processResult === "dropped") {
          if (await unsetPendingTransaction(pendingTransaction, false)) {
            addNotification(buildWarnNotification(
              "Transaction has been dropped",
              {
                type: "transactionWasDropped",
                transactionSignature: pendingTransaction,
                timeout: PENDING_TRANSACTION_TIMEOUT
              },
            ))
          }
        }
        if (processResult === "confirmed") {
          if (await unsetPendingTransaction(pendingTransaction, true)) {
            addNotification(createTransactionConfirmedNotification())
          }
        }
      }, PENDING_TRANSACTION_PROCESSING_INTERVAL
    );

    setPendingTransactionState(state => ({
      ...state,
      pendingTransaction,
      pendingTransactionIntervalId
    }))
  }, [boardDispatch, boardHistoryDispatch, addNotification, setPendingTransactionState, unsetPendingTransaction]);
  return {setPendingTransaction, unsetPendingTransaction};
}

export function createTransactionConfirmedNotification() {
  return buildSuccessNotification(
    "Transaction has been confirmed",
    {
      type: "string",
      content: "Pixels have been changed on-chain"
    }
  );
}

async function processPendingTransaction(
  pendingTransactionSignature: TransactionSignature,
  sentAt: number,
  boardDispatch: BoardStateDispatch,
  boardHistoryDispatch: BoardHistoryDispatch
): Promise<"dropped" | "confirmed" | "retry"> {
  if (Date.now() - sentAt > PENDING_TRANSACTION_TIMEOUT) {
    return "dropped";
  }
  const transactionChanges = await fetchTransactionEvents(pendingTransactionSignature);
  if (transactionChanges === null) {
    console.log(`Transaction ${pendingTransactionSignature} is not confirmed yet, keep waiting...`);
    return "retry";
  }
  for (const gameEventWithTransactionDetails of transactionChanges.events) {
    updateBoardStateAndHistory(gameEventWithTransactionDetails, boardDispatch, boardHistoryDispatch);
  }
  return "confirmed";
}