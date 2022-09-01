import * as React from "react";
import {useBoardDispatch} from "../board/boardState";
import {TransactionSignature} from "@solana/web3.js";
import {fetchTransactionEvents} from "../../request/fetchTransactionEvents";
import {useBoardHistoryDispatch} from "../board/boardHistory";
import {updateBoardStateAndHistory} from "../../app";

const PENDING_TRANSACTION_PROCESSING_INTERVAL = 5000;
const PENDING_TRANSACTION_TIMEOUT = 90000;

type SetPendingTransaction = (pendingTransaction: TransactionSignature) => void;

export function useSetPendingTransaction(): SetPendingTransaction {
  const boardDispatch = useBoardDispatch();
  const boardHistoryDispatch = useBoardHistoryDispatch();

  return React.useCallback((pendingTransaction: TransactionSignature) => {
    const sentAt = Date.now();

    async function processPendingTransactions() {
      if (Date.now() - sentAt > PENDING_TRANSACTION_TIMEOUT) {
        console.log(`Pending transaction ${pendingTransaction} has not been confirmed in ${PENDING_TRANSACTION_TIMEOUT / 1000} seconds`);
        boardDispatch({
          type: "unsetPendingTransaction"
        })
        return;
      }
      const transactionChanges = await fetchTransactionEvents(pendingTransaction);
      if (transactionChanges === null) {
        console.log(`Pending transaction ${pendingTransaction} is not confirmed yet, keep waiting...`);
        return
      }
      console.log(`Pending transaction ${pendingTransaction} has been confirmed`);
      updateBoardStateAndHistory(transactionChanges.events, boardDispatch, boardHistoryDispatch);
    }

    const pendingTransactionIntervalId = window.setInterval(processPendingTransactions, PENDING_TRANSACTION_PROCESSING_INTERVAL);

    boardDispatch({
      type: "setPendingTransaction",
      pendingTransaction,
      pendingTransactionIntervalId
    })
  }, [boardDispatch, boardHistoryDispatch]);
}