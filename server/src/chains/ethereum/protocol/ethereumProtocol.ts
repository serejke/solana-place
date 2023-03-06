import { GameEvent } from "../../../model/gameEvent";
import { Protocol } from "../../../protocol/protocol";
import { EventListener } from "../../../protocol/eventListener";

export class EthereumProtocol<T extends GameEvent> implements Protocol {
  addListener(listener: EventListener): void {
    return;
  }
}
