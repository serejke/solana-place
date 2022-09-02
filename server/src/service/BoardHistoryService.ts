import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {EventParser} from "@project-serum/anchor";
import {CloseableService} from "./CloseableService";
import {EventsHistory, EventWithTransactionDetails} from "../model/eventsHistory";
import {TransactionDetails} from "../model/transactionDetails";
import {rethrowRpcError} from "../errors/serverError";
import {parseProgramGameEvent} from "../program/parser";
import {ConfirmedSignatureInfo, Connection, Finality, TransactionResponse, TransactionSignature} from "@solana/web3.js";

export class BoardHistoryService implements CloseableService {

  private readonly eventParser: EventParser;
  private readonly connection: Connection;
  private finalizedTransactionCache: Map<TransactionSignature, TransactionResponse> = new Map<TransactionSignature, TransactionResponse>();

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
    const confirmedSignatures: ConfirmedSignatureInfo[] = await this.connection.getSignaturesForAddress(
      GAME_PROGRAM_ACCOUNT,
      {limit},
      "confirmed"
    ).catch((e) => rethrowRpcError(e));

    const eventsWithDetails = await Promise.all(
      confirmedSignatures.map(async (confirmedSignatureInfo) => {
        if (confirmedSignatureInfo.err) {
          return null;
        }
        // Undocumented field https://github.com/solana-labs/solana/issues/27569
        // eslint-disable-next-line
        const confirmationStatus = (confirmedSignatureInfo as any).confirmationStatus
        return this.getConfirmedTransactionEvents(confirmedSignatureInfo.signature, confirmationStatus);
      })
    ).catch((e) => rethrowRpcError(e));

    return {
      events: eventsWithDetails.flatMap(e => e ?? []),
    }
  }

  async getTransactionEventsIfFound(
    signature: TransactionSignature
  ): Promise<EventsHistory | null> {
    const signatureStatus = await this.connection.getSignatureStatus(signature, {searchTransactionHistory: true});
    if (!signatureStatus.value) return null;
    if (signatureStatus.value.err) return {events: []};
    const confirmation = signatureStatus.value.confirmationStatus;
    if (!confirmation) return null;
    if (confirmation !== "confirmed" && confirmation !== "finalized") return null;
    const events = await this.getConfirmedTransactionEvents(signature, confirmation);
    if (events === null) {
      return null;
    }
    return {events}
  }

  private async getConfirmedTransactionEvents(
    signature: string,
    confirmation: Finality
  ): Promise<EventWithTransactionDetails[] | null> {
    const cachedTransaction = this.finalizedTransactionCache.get(signature);
    const transaction = cachedTransaction ?? await this.connection.getTransaction(signature, {commitment: confirmation});
    if (!transaction) return null;
    if (confirmation === "finalized") {
      this.finalizedTransactionCache.set(signature, transaction);
    }

    const meta = transaction.meta;
    if (!meta) return null;
    if (meta.err) return [];
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