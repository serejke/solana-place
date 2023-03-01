import { Cluster } from "@solana/web3.js";
import { BlockchainAddressString } from "../model/blockchainAddress";

export type ServerInfoDto = {
  chains: {
    solana: {
      programId: BlockchainAddressString;
      cluster: Cluster | "custom";
      gameAccount: BlockchainAddressString;
    };
  };
};
