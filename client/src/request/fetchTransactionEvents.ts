import {BoardHistory} from "../model/model";
import {reportError, sleep} from "../utils";
import {EventsWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";
import {parseBoardHistory} from "../dto-converter/converter";
import {TransactionSignature} from "@solana/web3.js";
import {serverUrl} from "./serverUrls";

export async function fetchTransactionEvents(
  transactionSignature: TransactionSignature
): Promise<BoardHistory | null> {
  while (true) {
    const response: BoardHistory | null | "retry" = await fetchTransactionEventsOrRetry(transactionSignature);
    if (response === "retry") {
      await sleep(2000);
    } else {
      return response;
    }
  }
}

async function fetchTransactionEventsOrRetry(
  signature: TransactionSignature
): Promise<BoardHistory | null | "retry"> {
  try {
    const response = await fetch(
      new Request(
        `${serverUrl}/api/board/changePixels/status?transactionSignature=${signature}`,
        {
          method: "GET",
          headers: {"Content-Type": "application/json"}
        }
      )
    );
    if (response.status === 404) {
      return null;
    }
    const eventsWithTransactionDetails: EventsWithTransactionDetailsDto = await response.json();
    return parseBoardHistory(eventsWithTransactionDetails);
  } catch (err) {
    reportError(err, "/api/board/history failed");
    return "retry";
  }
}