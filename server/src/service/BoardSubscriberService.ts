import AnchorService from "./AnchorService";
import WebSocketServer from "../controller/websocket";
import {PixelChangedEventDto} from "../dto/dto";
import {CloseableService} from "./CloseableService";

export class BoardSubscriberService implements CloseableService {
  constructor(
    private listenerId: number,
    private anchorState: AnchorService
  ) {
  }

  static create(anchorState: AnchorService, webSocketServer: WebSocketServer): BoardSubscriberService {
    const listenerId = anchorState.solanaPlaceProgram.addEventListener(
      "PixelColorChangedEvent",
      (event, slot, signature) => {
        const state = event.state as number;
        const row = event.row as number;
        const column = event.column as number;
        const oldColor = event.oldColor as number;
        const newColor = event.newColor as number;
        const pixelChangedEvent: PixelChangedEventDto = {
          row, column, oldColor, newColor, state
        }
        const message = {
          type: "pixelChangedEvent",
          pixelChangedEvent
        }
        webSocketServer.send(message);
      });
    return new BoardSubscriberService(listenerId, anchorState);
  }

  async close(): Promise<void> {
    await this.anchorState.solanaPlaceProgram.removeEventListener(this.listenerId);
  }
}