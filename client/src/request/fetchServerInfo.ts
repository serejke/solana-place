import { sleep } from "utils";
import {
  ServerConfigState,
  ConfigStatus,
  SetServerConfigState,
} from "../reducers/serverConfigReducer";
import { rethrowIfFailed } from "./requestError";
import { ServerInfoDto } from "../dto/serverInfoDto";
import { BlockchainAddress } from "../model/blockchainAddress";

export async function fetchServerInfo(
  setServerConfigState: SetServerConfigState,
  serverUrl: string
) {
  setServerConfigState({
    status: ConfigStatus.Fetching,
  });

  while (true) {
    let response: ServerConfigState | "retry" = await fetchServerInfoOrRetry(
      serverUrl
    );
    if (response === "retry") {
      await sleep(2000);
    } else {
      setServerConfigState(response);
      break;
    }
  }
}

async function fetchServerInfoOrRetry(
  httpUrl: string
): Promise<ServerConfigState | "retry"> {
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
        chains: {
          solana: {
            cluster: data.chains.solana.cluster,
            programId: BlockchainAddress.from(data.chains.solana.programId),
            gameAccount: BlockchainAddress.from(data.chains.solana.gameAccount),
          },
        },
      },
    };
  } catch (err) {
    console.error("/api/init failed", err);
    return "retry";
  }
}
