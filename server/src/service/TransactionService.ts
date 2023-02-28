import { SerializedTransactionDto } from "../dto/transactionDto";
import { TransactionSignature } from "@solana/web3.js";

export interface TransactionService {
  send(
    serializedTransactionDto: SerializedTransactionDto
  ): Promise<TransactionSignature>;
}
