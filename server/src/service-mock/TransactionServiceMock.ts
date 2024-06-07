import { Transaction, TransactionSignature } from "@solana/web3.js";
import { CloseableService } from "../service/CloseableService";
import * as base58 from "bs58";

export class TransactionServiceMock implements CloseableService {
  static create(): TransactionServiceMock {
    return new TransactionServiceMock();
  }

  async send(transaction: Transaction): Promise<TransactionSignature> {
    return base58.encode(Uint8Array.from(transaction.signatures[0].signature!));
  }

  async close(): Promise<void> {
    return;
  }
}
