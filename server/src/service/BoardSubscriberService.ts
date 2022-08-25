import AnchorService from "./AnchorService";
import {CloseableService} from "./CloseableService";
import {GameEvent} from "../model/gameEvent";
import {Protocol} from "../protocol/protocol";

export class BoardSubscriberService implements CloseableService {
  private readonly listenerId: number;

  constructor(
    private anchorState: AnchorService,
    private protocol: Protocol<GameEvent>
  ) {
    this.listenerId = anchorState.solanaPlaceProgram.addEventListener(
      "PixelColorsChangedEvent",
      async (event, slot, signature) => {
        // eslint-disable-next-line
        const changes: GameEvent[] = event.changes.map((change: any, index: number) => ({
          type: "pixelChangedEvent",
          state: event.state + index,
          row: change.row,
          column: change.column,
          oldColor: change.oldColor,
          newColor: change.newColor,
        }));
        for (const change of changes) {
          await this.protocol.onEvent(change, slot, signature)
        }
      });
  }

  static create(
    anchorState: AnchorService,
    protocol: Protocol<GameEvent>
  ): BoardSubscriberService {
    return new BoardSubscriberService(anchorState, protocol);
  }

  async close(): Promise<void> {
    await this.anchorState.solanaPlaceProgram.removeEventListener(this.listenerId);
  }
}