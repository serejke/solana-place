import {Connection, TransactionError} from "@solana/web3.js";
import {GameEvent} from "../model/gameEvent";
import {EventListener} from "./eventListener";
import {TransactionDetails} from "../model/transactionDetails";
import {EventWithTransactionDetails} from "../model/eventsHistory";

export class Protocol<T extends GameEvent> {

  private listeners: EventListener[] = [];

  constructor(
    private connection: Connection
  ) {
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
      console.warn(`Transaction ${signature} is not confirmed nor finalized yet`);
      return this.onEventWithoutTransaction(event, slot, signature);
    }

    const transaction = await this.connection.getTransaction(signature, { commitment: confirmation });
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
    const transactionDetails: TransactionDetails = { signature, confirmation, sender, timestamp }
    return this.onEventConfirmation(event, slot, signature, transactionDetails);
  }

  async onEventWithoutTransaction(
    event: T,
    slot: number,
    signature: string,
  ): Promise<void> {
    console.info(`Transaction ${signature} must be processed later.`);
    // Add this change to a pending queue and periodically query the RPC Node on its status up until N times.
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
}