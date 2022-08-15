import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {EventParser} from "@project-serum/anchor";
import {BoardChange, BoardHistory, PixelChangedEvent} from "../model/model";
import {CloseableService} from "./CloseableService";

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

  async getBoardHistory(): Promise<BoardHistory> {
    const connection = this.anchorState.anchorProvider.connection;
    // TODO[sync]: pagination when >1000 transactions.
    const signaturesForAddress = await connection.getSignaturesForAddress(
      GAME_PROGRAM_ACCOUNT,
      undefined,
      "confirmed"
    );

    const changeEvents = await Promise.all(
      signaturesForAddress.map(async (confirmedSignatureInfo) => {
        const signature = confirmedSignatureInfo.signature;
        const confirmationStatus: "confirmed" | "finalized" = (confirmedSignatureInfo as any).confirmationStatus;
        const transaction = await connection.getTransaction(signature, { commitment: confirmationStatus});
        if (!transaction) return null;
        const meta = transaction.meta;
        if (!meta) return null;
        if (meta.err) return null;
        const sender = transaction.transaction.message.accountKeys[0].toBase58();
        const timestamp = transaction.blockTime ?? confirmedSignatureInfo.blockTime;
        if (!timestamp) return null;
        const logMessages = meta.logMessages;
        if (!logMessages) return null;
        const logs: any[] = Array.from(this.eventParser.parseLogs(logMessages));
        return logs
          .filter(log => log.name === "PixelColorChangedEvent")
          .map(log => log.data)
          .map(data => data as PixelChangedEvent)
          .map(event => {
            const change: BoardChange = {
              change: event,
              transactionDetails: {
                signature,
                confirmation: confirmationStatus,
                sender,
                timestamp
              }
            }
            return change;
          })
      })
    );

    return {
      changes: changeEvents.flatMap(e => e ?? []),
    }
  }

  async close(): Promise<void> {
    return;
  }
}