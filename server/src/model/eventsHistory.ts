import {GameEvent} from "./gameEvent";
import {TransactionDetails} from "./transactionDetails";

export type EventWithTransactionDetails = {
  event: GameEvent,
  transactionDetails: TransactionDetails
}

export type EventsHistory = {
  events: EventWithTransactionDetails[];
}