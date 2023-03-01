import { Cluster } from "@solana/web3.js";
import { BlockchainAddress } from "./blockchainAddress";

export interface ServerConfig {
  chains: {
    solana: {
      cluster: Cluster | "custom";
      programId: BlockchainAddress;
      gameAccount: BlockchainAddress;
    };
  };
}
