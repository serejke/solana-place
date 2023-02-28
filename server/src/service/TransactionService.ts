import { SerializedTransactionDto } from "../dto/transactionDto";
import { TransactionSignature } from "../model/transactionDetails";

export interface TransactionService {
  send(
    serializedTransactionDto: SerializedTransactionDto
  ): Promise<TransactionSignature>;
}
