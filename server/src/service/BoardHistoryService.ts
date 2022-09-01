import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {EventParser} from "@project-serum/anchor";
import {CloseableService} from "./CloseableService";
import {EventsHistory, EventWithTransactionDetails} from "../model/eventsHistory";
import {TransactionDetails} from "../model/transactionDetails";
import {rethrowRpcError} from "../errors/serverError";
import {parseProgramGameEvent} from "../program/parser";
import {Connection, TransactionSignature} from "@solana/web3.js";

export class BoardHistoryService implements CloseableService {

  private readonly eventParser: EventParser;
  private readonly connection: Connection;

  constructor(
    private anchorState: AnchorService
  ) {
    this.eventParser = new EventParser(PROGRAM_ID, anchorState.solanaPlaceProgram.coder);
    this.connection = anchorState.anchorProvider.connection;
  }

  static create(anchorState: AnchorService): BoardHistoryService {
    return new BoardHistoryService(anchorState);
  }

  async getBoardHistory(limit: number): Promise<EventsHistory> {
    const signaturesForAddress = await this.connection.getSignaturesForAddress(
      GAME_PROGRAM_ACCOUNT,
      {limit},
      "confirmed"
    ).catch((e) => rethrowRpcError(e));

    const eventsWithDetails = await Promise.all(
      signaturesForAddress.map(async (confirmedSignatureInfo) => this.getTransactionEvents(confirmedSignatureInfo.signature))
    ).catch((e) => rethrowRpcError(e));

    return {
      events: eventsWithDetails.flatMap(e => e ?? []),
    }
  }

  async getTransactionEventsIfFound(
    transactionSignature: TransactionSignature
  ): Promise<EventsHistory | null> {
    const events = await this.getTransactionEvents(transactionSignature);
    if (events === null) {
      return null;
    }
    return {events}
  }

  private async getTransactionEvents(
    signature: TransactionSignature
  ): Promise<EventWithTransactionDetails[] | null> {
    const signatureStatus = await this.connection.getSignatureStatus(signature, { searchTransactionHistory: true });
    if (!signatureStatus.value) return null;
    const confirmation = signatureStatus.value.confirmationStatus;
    if (!confirmation) return null;
    if (confirmation !== "confirmed" && confirmation !== "finalized") return null;

    const transaction = await this.connection.getTransaction(signature, {commitment: confirmation});
    if (!transaction) return null;
    const meta = transaction.meta;
    if (!meta) return null;
    if (meta.err) return null;
    const sender = transaction.transaction.message.accountKeys[0]
    const timestamp = transaction.blockTime;
    if (!timestamp) return null;
    const logMessages = meta.logMessages;
    if (!logMessages) return null;
    const transactionDetails: TransactionDetails = {
      signature,
      confirmation,
      sender,
      timestamp
    };
    // eslint-disable-next-line
    const logs: any[] = Array.from(this.eventParser.parseLogs(logMessages));
    return logs
      .map(log => parseProgramGameEvent(log))
      .map(event => ({event, transactionDetails}))
  }

  async close(): Promise<void> {
    return;
  }
}