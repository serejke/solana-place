import {
  TransactionConfirmationStatus,
  TransactionSignature,
} from "@solana/web3.js";
import { BlockchainAddress } from "./blockchainAddress";

export type TransactionDetails = {
  signature: TransactionSignature;
  sender: BlockchainAddress;
  timestamp: number;
  confirmation: TransactionConfirmationStatus;
};
