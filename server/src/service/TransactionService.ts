import {Connection, Transaction, TransactionSignature} from "@solana/web3.js";
import {CloseableService} from "./CloseableService";
import {rethrowRpcError} from "../errors/serverError";

export class TransactionService implements CloseableService {

  constructor(private connection: Connection) {
  }

  static create(connection: Connection): TransactionService {
    return new TransactionService(connection);
  }

  async send(
    transaction: Transaction
  ): Promise<TransactionSignature> {
    const serializedTransaction = transaction.serialize();
    return this.connection
      .sendRawTransaction(serializedTransaction)
      .catch((e) => rethrowRpcError(e));
  }

  async close(): Promise<void> {
    return;
  }
}