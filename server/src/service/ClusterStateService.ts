import { Connection } from "@solana/web3.js";
import { CloseableService } from "./CloseableService";

export class ClusterStateService implements CloseableService {
  private readonly listenerId: number;

  public latestSlot: number;
  public latestTimestamp: number;

  constructor(private connection: Connection) {
    this.latestSlot = 0;
    this.latestTimestamp = 0;
    this.listenerId = connection.onSlotUpdate((slotUpdate) => {
      this.latestTimestamp = slotUpdate.timestamp;
      this.latestSlot = slotUpdate.slot;
      console.log(
        "Slot",
        this.latestTimestamp,
        this.latestSlot,
        new Date(this.latestTimestamp)
      );
    });
  }

  static create(connection: Connection): ClusterStateService {
    return new ClusterStateService(connection);
  }

  async close(): Promise<void> {
    await this.connection.removeSlotUpdateListener(this.listenerId);
  }
}
