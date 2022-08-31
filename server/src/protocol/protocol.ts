import {Connection, TransactionError} from "@solana/web3.js";
import {GameEvent} from "../model/gameEvent";
import {EventListener} from "./eventListener";
import {TransactionDetails} from "../model/transactionDetails";
import {EventWithTransactionDetails} from "../model/eventsHistory";
import {CloseableService} from "../service/CloseableService";

const PENDING_TRANSACTIONS_PROCESSING_INTERVAL = 5000;
const PENDING_TRANSACTION_TIMEOUT = 90000;

export class Protocol<T extends GameEvent> implements CloseableService {

  private listeners: EventListener[] = [];

  // Transactions received with status 'processed' instead of 'confirmed' or 'finalized'.
  //  We need to periodically poll the transaction's info and send the update to clients on success.
  //  Max timeout for a pending transaction is [PENDING_TRANSACTION_TIMEOUT].
  private pendingTransactions: {
    event: T,
    slot: number,
    signature: string,
    receivedAt: number
  }[] = [];

  private readonly pendingTransactionProcessorId: NodeJS.Timeout;

  private isProcessingPendingTransactions = false;

  constructor(
    private connection: Connection
  ) {
    this.pendingTransactionProcessorId = setInterval(
      () => {
        this.isProcessingPendingTransactions = true;
        this.processPendingTransactions()
          .catch((e) => console.error("Failed to process pending transactions", e))
          .finally(() => {
            this.isProcessingPendingTransactions = false;
          });
      },
      PENDING_TRANSACTIONS_PROCESSING_INTERVAL
    )
  }

  addListener(listener: EventListener): void {
    this.listeners.push(listener);
  }

  async onEvent(
    event: T,
    slot: number,
    signature: string
  ): Promise<void> {
    const signatureStatus = (await this.connection.getSignatureStatus(signature)).value;
    if (!signatureStatus) {
      console.warn(`Transaction ${signature} is not found`);
      return this.onEventWithoutTransaction(event, slot, signature);
    }
    if (signatureStatus.err) {
      return this.onEventError(event, slot, signature, signatureStatus.err);
    }
    const confirmation = signatureStatus.confirmationStatus;
    if (!confirmation) {
      console.error(`Wrong response from RPC: both err and confirmationStatus are null for transaction ${signature}`);
      return;
    }

    if (confirmation !== "confirmed" && confirmation !== "finalized") {
      console.warn(`Transaction ${signature} is not confirmed nor finalized but ${confirmation}`);
      return this.onEventWithoutTransaction(event, slot, signature);
    }

    return await this.handleEvent(event, slot, signature, confirmation);
  }

  private async handleEvent(
    event: T,
    slot: number,
    signature: string,
    commitment: "confirmed" | "finalized"
  ): Promise<void> {
    const transaction = await this.connection.getTransaction(signature, {commitment});
    if (!transaction) {
      console.warn(`Transaction ${signature} status is received but transaction is not yet available via RPC`)
      return this.onEventWithoutTransaction(event, slot, signature);
    }

    const timestamp = transaction.blockTime;
    if (!timestamp) {
      console.warn(`Transaction ${signature} doesn't provide blockTime`);
      return this.onEventWithoutTransaction(event, slot, signature);
    }

    const sender = transaction.transaction.message.accountKeys[0];
    const transactionDetails: TransactionDetails = {signature, confirmation: commitment, sender, timestamp}
    return this.onEventConfirmation(event, slot, signature, transactionDetails);
  }

  private async onEventWithoutTransaction(
    event: T,
    slot: number,
    signature: string,
  ): Promise<void> {
    console.info(`Transaction ${signature} must be processed later.`);
    const receivedAt = Date.now();
    this.pendingTransactions.push({event, slot, signature, receivedAt});
  }

  async onEventError(
    event: T,
    slot: number,
    signature: string,
    error: TransactionError
  ): Promise<void> {
    console.log(`Transaction ${signature} failed with ${signature}`, error);
  }

  async onEventConfirmation(
    event: T,
    slot: number,
    signature: string,
    transactionDetails: TransactionDetails
  ): Promise<void> {
    console.log(`Transaction ${signature} has been ${transactionDetails.confirmation}, sent by ${transactionDetails.sender.toBase58()} at ${transactionDetails.timestamp}`)
    const eventWithTransactionDetails: EventWithTransactionDetails = {
      event,
      transactionDetails
    }
    this.listeners.forEach((listener) => listener(eventWithTransactionDetails));
  }

  private async processPendingTransactions() {
    // Fix the length in a const. The [pendingTransactions] array might be appended.
    const length = this.pendingTransactions.length;
    for (let i = 0; i < length; i++) {
      const {event, slot, signature, receivedAt} = this.pendingTransactions.splice(0, 1)[0];
      if (Date.now() - receivedAt > PENDING_TRANSACTION_TIMEOUT) {
        console.log(`Drop pending transaction by timeout ${signature}`);
        continue;
      }
      await this.onEvent(event, slot, signature)
    }
  }

  async close(): Promise<void> {
    clearTimeout(this.pendingTransactionProcessorId);
  }
}