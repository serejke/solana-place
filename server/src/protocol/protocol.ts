import { EventListener } from "./eventListener";

export interface Protocol {
  addListener(listener: EventListener): void;
}
