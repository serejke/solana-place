import {reportError, sleep} from "utils";
import {Action, ClusterConfig, ConfigStatus, Dispatch} from "../cluster";
import {PublicKey} from "@solana/web3.js";

export async function fetchWithRetry(
  dispatch: Dispatch,
  serverUrl: string
) {
  dispatch({
    status: ConfigStatus.Fetching,
  });

  while (true) {
    let response: Action | "retry" = await fetchInit(serverUrl);
    if (response === "retry") {
      await sleep(2000);
    } else {
      dispatch(response);
      break;
    }
  }
}

async function fetchInit(httpUrl: string): Promise<Action | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/api/init", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
    );
    const data = await response.json();
    if (!("cluster" in data) || !("programId" in data)) {
      console.error(`/init failed because of invalid response ${JSON.stringify(data)}`)
      return "retry";
    }

    return {
      status: ConfigStatus.Initialized,
      config: parseInitClusterConfigResponse(data),
    };
  } catch (err) {
    reportError(err, "/init failed");
    return "retry";
  }
}

function parseInitClusterConfigResponse(response: any): ClusterConfig {
  return {
    cluster: response.cluster,
    programId: new PublicKey(response.programId),
    gameAccount: new PublicKey(response.gameAccount)
  };
}