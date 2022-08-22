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
      "PixelColorChangedEvent",
      async (event, slot, signature) => {
        console.log(event, slot, signature);
        const state = event.state as number;
        const row = event.row as number;
        const column = event.column as number;
        const oldColor = event.oldColor as number;
        const newColor = event.newColor as number;
        const pixelChangedEvent: GameEvent = {
          type: "pixelChangedEvent",
          row,
          column,
          oldColor,
          newColor,
          state
        }
        await this.protocol.onEvent(pixelChangedEvent, slot, signature);
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