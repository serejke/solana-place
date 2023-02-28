import { EventsHistory } from "../model/eventsHistory";
import { TransactionSignature } from "../model/transactionDetails";

export interface BoardHistoryService {
  getBoardHistory(limit: number): Promise<EventsHistory>;

  getTransactionEventsIfFound(
    signature: TransactionSignature
  ): Promise<EventsHistory | null>;
}
