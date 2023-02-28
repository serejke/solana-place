import { Cluster } from "@solana/web3.js";

export type ServerInfoDto = {
  chains: {
    solana: {
      programId: string;
      cluster: Cluster | "custom";
      gameAccount: string;
    };
  };
};
