import {BoardHistory} from "../model/model";
import {EventsWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";
import {parseBoardHistory} from "../dto-converter/converter";
import {reportError, sleep} from "../utils";

export async function fetchBoardHistory(httpUrl: string): Promise<BoardHistory> {
  while (true) {
    let response: BoardHistory | "retry" = await fetchBoardHistoryOrRetry(httpUrl);
    if (response === "retry") {
      await sleep(2000);
    } else {
      return response;
    }
  }
}

async function fetchBoardHistoryOrRetry(httpUrl: string): Promise<BoardHistory | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/api/board-history", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
      })
    );
    const eventsWithTransactionDetails: EventsWithTransactionDetailsDto = await response.json();
    return parseBoardHistory(eventsWithTransactionDetails);
  } catch (err) {
    reportError(err, "/board-history failed");
    return "retry";
  }
}