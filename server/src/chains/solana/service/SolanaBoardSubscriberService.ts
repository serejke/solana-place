import SolanaAnchorService from "./SolanaAnchorService";
import { CloseableService } from "../../../service/CloseableService";
import { GameEvent } from "../../../model/gameEvent";
import { SolanaProtocol } from "../protocol/solanaProtocol";
import {
  parseProgramGameEvent,
  PIXEL_COLORS_CHANGED_EVENT_NAME,
} from "../program/parser";

export class SolanaBoardSubscriberService implements CloseableService {
  private readonly listenerId: number;

  constructor(
    private anchorState: SolanaAnchorService,
    private protocol: SolanaProtocol<GameEvent>
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
    anchorState: SolanaAnchorService,
    protocol: SolanaProtocol<GameEvent>
  ): SolanaBoardSubscriberService {
    return new SolanaBoardSubscriberService(anchorState, protocol);
  }

  async close(): Promise<void> {
    await this.anchorState.solanaPlaceProgram.removeEventListener(
      this.listenerId
    );
  }
}
