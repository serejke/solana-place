import { sleep } from "../utils";
import { BoardStateDto } from "../dto/boardStateDto";
import { rethrowIfFailed } from "./requestError";

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

async function fetchBoardOrRetry(
  httpUrl: string
): Promise<BoardStateDto | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/api/board", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
    await rethrowIfFailed(response);
    const data = await response.json();

    return {
      state: data.state,
      width: data.width,
      height: data.height,
      colors: data.colors,
    };
  } catch (err) {
    console.error("/board failed", err);
    return "retry";
  }
}
