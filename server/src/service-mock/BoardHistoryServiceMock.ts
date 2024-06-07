import { EventsHistory } from "../model/eventsHistory";
import { CloseableService } from "../service/CloseableService";

export class BoardHistoryServiceMock implements CloseableService {
  static create(): BoardHistoryServiceMock {
    return new BoardHistoryServiceMock();
  }

  async getBoardHistory(_limit: number): Promise<EventsHistory> {
    return {
      events: [],
    };
  }

  async close(): Promise<void> {
    return;
  }
}
