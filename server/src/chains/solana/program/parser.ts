// eslint-disable-next-line
import { GameEvent } from "../../../model/gameEvent";

type ProgramEvent = {
  name: string;
  data: ProgramPixelsColorChangedEvent;
};

type ProgramPixelsColorChangedEvent = {
  state: number;
  newState: number;
  changes: ProgramPixelColorChange[];
};

type ProgramPixelColorChange = {
  row: number;
  column: number;
  oldColor: number;
  newColor: number;
};

export const PIXEL_COLORS_CHANGED_EVENT_NAME = "PixelColorsChangedEvent";

export function parseProgramGameEvent(log: ProgramEvent): GameEvent {
  if (log.name === PIXEL_COLORS_CHANGED_EVENT_NAME) {
    const event: ProgramPixelsColorChangedEvent = log.data;
    return { type: "pixelsChangedEvent", ...event };
  }
  throw new Error(`Unknown log type ${log.name}`);
}
