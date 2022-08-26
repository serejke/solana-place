import {PixelsChangedEventDto} from "./pixelsChangedEventDto";

export type EventWithTypeDto =
  { type: "pixelsChangedEvent" } & PixelsChangedEventDto;