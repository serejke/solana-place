import { Connection, Transaction, TransactionSignature } from "@solana/web3.js";
import { CloseableService } from "../../../service/CloseableService";
import { rethrowRpcError } from "../../../errors/serverError";
import base58 from "bs58";
import { SerializedTransactionDto } from "../../../dto/transactionDto";
import { TransactionService } from "../../../service/TransactionService";

export class SolanaTransactionService
  implements CloseableService, TransactionService
{
  constructor(private connection: Connection) {}

  static create(connection: Connection): SolanaTransactionService {
    return new SolanaTransactionService(connection);
  }

  async send(
    serializedTransactionDto: SerializedTransactionDto
  ): Promise<TransactionSignature> {
    const transaction = Transaction.from(
      base58.decode(serializedTransactionDto.transactionBase58)
    );
    const serializedTransaction = transaction.serialize();
    return this.connection
      .sendRawTransaction(serializedTransaction)
      .catch((e) => rethrowRpcError(e));
  }

  async close(): Promise<void> {
    return;
  }
}
