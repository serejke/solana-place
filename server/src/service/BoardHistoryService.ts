import { EventsHistory } from "../model/eventsHistory";
import { TransactionSignature } from "@solana/web3.js";

export interface BoardHistoryService {
  getBoardHistory(limit: number): Promise<EventsHistory>;

  getTransactionEventsIfFound(
    signature: TransactionSignature
  ): Promise<EventsHistory | null>;
}
