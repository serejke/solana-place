import AnchorService from "./AnchorService";
import { CloseableService } from "./CloseableService";
import { GameEvent } from "../model/gameEvent";
import { Protocol } from "../protocol/protocol";
import {
  parseProgramGameEvent,
  PIXEL_COLORS_CHANGED_EVENT_NAME,
} from "../program/parser";

export class BoardSubscriberService implements CloseableService {
  private readonly listenerId: number;

  constructor(
    private anchorState: AnchorService,
    private protocol: Protocol<GameEvent>
  ) {
    this.listenerId = anchorState.solanaPlaceProgram.addEventListener(
      PIXEL_COLORS_CHANGED_EVENT_NAME,
      async (event, slot, signature) => {
        const gameEvent = parseProgramGameEvent({
          name: PIXEL_COLORS_CHANGED_EVENT_NAME,
          data: event,
        });
        await this.protocol.onEvent(gameEvent, slot, signature);
      }
    );
  }

  static create(
    anchorState: AnchorService,
    protocol: Protocol<GameEvent>
  ): BoardSubscriberService {
    return new BoardSubscriberService(anchorState, protocol);
  }

  async close(): Promise<void> {
    await this.anchorState.solanaPlaceProgram.removeEventListener(
      this.listenerId
    );
  }
}
