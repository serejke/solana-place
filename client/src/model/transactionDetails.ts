import { BlockchainAddress } from "./blockchainAddress";

export type TransactionSignature = string;

export type TransactionConfirmation = "processed" | "confirmed" | "finalized";

export type TransactionDetails = {
  signature: TransactionSignature;
  sender: BlockchainAddress;
  timestamp: number;
  confirmation: TransactionConfirmation;
};
