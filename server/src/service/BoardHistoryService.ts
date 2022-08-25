import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {EventParser} from "@project-serum/anchor";
import {CloseableService} from "./CloseableService";
import {EventsHistory} from "../model/eventsHistory";
import {parseProgramPixelColorChangedEvent} from "../program/board";
import {TransactionDetails} from "../model/transactionDetails";
import {rethrowRpcError} from "../errors/serverError";

export class BoardHistoryService implements CloseableService {

  private eventParser: EventParser;

  constructor(
    private anchorState: AnchorService
  ) {
    this.eventParser = new EventParser(PROGRAM_ID, anchorState.solanaPlaceProgram.coder);
  }

  static create(anchorState: AnchorService): BoardHistoryService {
    return new BoardHistoryService(anchorState);
  }

  async getBoardHistory(limit: number): Promise<EventsHistory> {
    const connection = this.anchorState.anchorProvider.connection;
    const signaturesForAddress = await connection.getSignaturesForAddress(
      GAME_PROGRAM_ACCOUNT,
      {limit},
      "confirmed"
    ).catch((e) => rethrowRpcError(e));

    const eventsWithDetails = await Promise.all(
      signaturesForAddress.map(async (confirmedSignatureInfo) => {
        const signature = confirmedSignatureInfo.signature;
        // Undocumented field. In fact, it is always present in the responses.
        // eslint-disable-next-line
        const confirmation: "confirmed" | "finalized" = (confirmedSignatureInfo as any).confirmationStatus;
        const transaction = await connection.getTransaction(signature, {commitment: confirmation});
        if (!transaction) return null;
        const meta = transaction.meta;
        if (!meta) return null;
        if (meta.err) return null;
        const sender = transaction.transaction.message.accountKeys[0]
        const timestamp = transaction.blockTime ?? confirmedSignatureInfo.blockTime;
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
          .filter(log => log.name === "PixelColorChangedEvent")
          .map(log => parseProgramPixelColorChangedEvent(log.data))
          .map(event => ({event, transactionDetails}))
      })
    ).catch((e) => rethrowRpcError(e));

    return {
      events: eventsWithDetails.flatMap(e => e ?? []),
    }
  }

  async close(): Promise<void> {
    return;
  }
}