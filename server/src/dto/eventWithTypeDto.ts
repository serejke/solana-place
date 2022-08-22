import {PixelChangedEventDto} from "./pixelChangedEventDto";

export type EventWithTypeDto = 
  { type: "pixelChangedEvent" } & PixelChangedEventDto;