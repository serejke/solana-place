import { sleep } from "utils";
import { PublicKey } from "@solana/web3.js";
import {
  ClusterConfigState,
  ConfigStatus,
  SetClusterConfigState,
} from "../reducers/clusterConfigReducer";
import { rethrowIfFailed } from "./requestError";
import { ServerInfoDto } from "../dto/clusterInfoDto";

export async function fetchClusterInfo(
  setClusterConfigState: SetClusterConfigState,
  serverUrl: string
) {
  setClusterConfigState({
    status: ConfigStatus.Fetching,
  });

  while (true) {
    let response: ClusterConfigState | "retry" = await fetchClusterInfoOrRetry(
      serverUrl
    );
    if (response === "retry") {
      await sleep(2000);
    } else {
      setClusterConfigState(response);
      break;
    }
  }
}

async function fetchClusterInfoOrRetry(
  httpUrl: string
): Promise<ClusterConfigState | "retry"> {
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
