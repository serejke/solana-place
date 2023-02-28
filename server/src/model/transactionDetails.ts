import { TransactionSignature } from "@solana/web3.js";
import { BlockchainAddress } from "./blockchainAddress";

export type TransactionConfirmation = "processed" | "confirmed" | "finalized";

export type TransactionDetails = {
  signature: TransactionSignature;
  sender: BlockchainAddress;
  timestamp: number;
  confirmation: TransactionConfirmation;
};
