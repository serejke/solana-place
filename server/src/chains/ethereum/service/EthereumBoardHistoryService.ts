import { BoardHistoryService } from "../../../service/BoardHistoryService";
import { EventsHistory } from "../../../model/eventsHistory";
import { TransactionSignature } from "../../../model/transactionDetails";

export class EthereumBoardHistoryService implements BoardHistoryService {
  async getBoardHistory(limit: number): Promise<EventsHistory> {
    return {
      events: [],
    };
  }

  async getTransactionEventsIfFound(
    signature: TransactionSignature
  ): Promise<EventsHistory | null> {
    return {
      events: [],
    };
  }
}
