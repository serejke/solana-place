import {reportError, sleep} from "utils";
import {Action, ClusterConfig, ConfigStatus, Dispatch} from "./index";
import {BoardHistoryDto, BoardStateDto} from "../dto/dto";
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
        headers: { "Content-Type": "application/json" }
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
        headers: { "Content-Type": "application/json" }
      })
    );
    return await response.json();
  } catch (err) {
    reportError(err, "/board failed");
    return "retry";
  }
}
