import {BoardHistoryDto, BoardStateDto} from "../dto/dto";
import {reportError, sleep} from "../../../utils";

export async function fetchBoard(httpUrl: string): Promise<BoardStateDto> {
  while (true) {
    let response: BoardStateDto | "retry" = await fetchBoardOrRetry(httpUrl);
    if (response === "retry") {
      await sleep(2000);
    } else {
      return response;
    }
  }
}

export async function fetchBoardHistory(httpUrl: string): Promise<BoardHistoryDto> {
  while (true) {
    let response: BoardHistoryDto | "retry" = await fetchBoardHistoryOrRetry(httpUrl);
    if (response === "retry") {
      await sleep(2000);
    } else {
      return response;
    }
  }
}

async function fetchBoardOrRetry(httpUrl: string): Promise<BoardStateDto | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/board", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
      })
    );
    const data = await response.json();

    return {
      state: data.state,
      width: data.width,
      height: data.height,
      colors: data.colors
    }
  } catch (err) {
    reportError(err, "/board failed");
    return "retry";
  }
}

async function fetchBoardHistoryOrRetry(httpUrl: string): Promise<BoardHistoryDto | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/board-history", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
      })
    );
    return await response.json();
  } catch (err) {
    reportError(err, "/board-history failed");
    return "retry";
  }
}