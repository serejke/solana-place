import {Cluster, PublicKey} from "@solana/web3.js";

export interface ClusterConfig {
  cluster: Cluster | "custom";
  programId: PublicKey;
  gameAccount: PublicKey;
}