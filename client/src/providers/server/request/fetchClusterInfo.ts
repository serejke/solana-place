import {reportError, sleep} from "utils";
import {Action, ClusterConfig, ConfigStatus, Dispatch} from "../cluster";
import React from "react";
import {Cluster, PublicKey} from "@solana/web3.js";

export async function fetchWithRetry(
  dispatch: Dispatch,
  httpUrlRef: React.MutableRefObject<string>
) {
  dispatch({
    status: ConfigStatus.Fetching,
  });

  const httpUrl = httpUrlRef.current;
  while (httpUrl === httpUrlRef.current) {
    let response: Action | "retry" = await fetchInit(httpUrl);
    if (httpUrl !== httpUrlRef.current) break;
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
      new Request(httpUrl + "/init", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
    );
    const data = await response.json();
    if (!("clusterUrl" in data) || !("programId" in data)) {
      console.error("/init failed because of invalid response")
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

function stringToCluster(str: string | undefined): Cluster | "custom" {
  switch (str) {
    case "devnet":
    case "testnet":
    case "mainnet-beta": {
      return str;
    }
    default:
      return "custom";
  }
}

function parseInitClusterConfigResponse(response: any): ClusterConfig {
  const cluster = stringToCluster(response.cluster);
  return {
    cluster,
    rpcUrl: response.clusterUrl,
    programId: new PublicKey(response.programId),
    gameAccount: new PublicKey(response.gameAccount)
  };
}