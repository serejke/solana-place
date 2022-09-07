import {GameEvent} from "./gameEvent";
import {TransactionDetails} from "./transactionDetails";

export type GameEventWithTransactionDetails = {
  event: GameEvent,
  transactionDetails: TransactionDetails
}

export type BoardHistory = {
  events: GameEventWithTransactionDetails[];
};

export const BOARD_HISTORY_MAX_LENGTH = 10;