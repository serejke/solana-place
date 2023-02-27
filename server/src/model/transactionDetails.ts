import {
  PublicKey,
  TransactionConfirmationStatus,
  TransactionSignature,
} from "@solana/web3.js";

export type TransactionDetails = {
  signature: TransactionSignature;
  sender: PublicKey;
  timestamp: number;
  confirmation: TransactionConfirmationStatus;
};
