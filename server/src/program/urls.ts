import { clusterApiUrl, Cluster } from "@solana/web3.js";

export const cluster: Cluster | "custom" = (() => {
  const envCluster = process.env.CLUSTER;
  if (envCluster) {
    switch (envCluster) {
      case "custom":
      case "devnet":
      case "testnet":
      case "mainnet-beta": {
        return envCluster;
      }
      default:
        throw new Error(`Unknown cluster value ${envCluster}`);
    }
  }
  return "custom";
})();

export const clusterUrl: string = (() => {
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
      return clusterApiUrl(cluster, true);
    case "custom":
      return "http://localhost:8899";
    default:
      throw new Error(`Unknown cluster ${cluster}`)
  }
})()
