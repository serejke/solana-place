import { BlockchainAddress } from "./blockchainAddress";

export type TransactionConfirmation = "processed" | "confirmed" | "finalized";

export type TransactionDetails = {
  signature: string;
  sender: BlockchainAddress;
  timestamp: number;
  confirmation: TransactionConfirmation;
};
