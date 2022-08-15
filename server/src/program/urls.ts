import { clusterApiUrl, Cluster } from "@solana/web3.js";

function chooseCluster(): Cluster | undefined {
  if (!process.env.LIVE) return;
  switch (process.env.CLUSTER) {
    case "devnet":
    case "testnet":
    case "mainnet-beta": {
      return process.env.CLUSTER;
    }
  }
  return "devnet";
}

export const cluster = chooseCluster();

export const clusterUrl =
  process.env.RPC_URL ||
  (process.env.LIVE ? clusterApiUrl(cluster, true) : "http://localhost:8899");
