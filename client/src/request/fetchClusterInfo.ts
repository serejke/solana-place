import {sleep} from "utils";
import {PublicKey} from "@solana/web3.js";
import {Action, ConfigStatus, Dispatch} from "../reducers/clusterConfigReducer";
import {rethrowIfFailed} from "./requestError";

export async function fetchClusterInfo(
  dispatch: Dispatch,
  serverUrl: string
) {
  dispatch({
    status: ConfigStatus.Fetching,
  });

  while (true) {
    let response: Action | "retry" = await fetchClusterInfoOrRetry(serverUrl);
    if (response === "retry") {
      await sleep(2000);
    } else {
      dispatch(response);
      break;
    }
  }
}

async function fetchClusterInfoOrRetry(httpUrl: string): Promise<Action | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/api/init", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
    );
    await rethrowIfFailed(response);
    const data = await response.json();
    if (!("cluster" in data) || !("programId" in data)) {
      console.error(`/api/init failed because of invalid response ${JSON.stringify(data)}`)
      return "retry";
    }

    return {
      status: ConfigStatus.Initialized,
      config: {
        cluster: data.cluster,
        programId: new PublicKey(data.programId),
        gameAccount: new PublicKey(data.gameAccount)
      },
    };
  } catch (err) {
    console.error("/api/init failed", err);
    return "retry";
  }
}