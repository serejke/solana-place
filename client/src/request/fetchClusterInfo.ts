import { sleep } from "utils";
import { PublicKey } from "@solana/web3.js";
import {
  Action,
  ConfigStatus,
  Dispatch,
} from "../reducers/clusterConfigReducer";
import { rethrowIfFailed } from "./requestError";
import { ServerInfoDto } from "../dto/clusterInfoDto";

export async function fetchClusterInfo(dispatch: Dispatch, serverUrl: string) {
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

async function fetchClusterInfoOrRetry(
  httpUrl: string
): Promise<Action | "retry"> {
  try {
    const response = await fetch(
      new Request(httpUrl + "/api/init", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
    await rethrowIfFailed(response);
    const data: ServerInfoDto = await response.json();
    return {
      status: ConfigStatus.Initialized,
      config: {
        cluster: data.chains.solana.cluster,
        programId: new PublicKey(data.chains.solana.programId),
        gameAccount: new PublicKey(data.chains.solana.gameAccount),
      },
    };
  } catch (err) {
    console.error("/api/init failed", err);
    return "retry";
  }
}
