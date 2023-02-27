export type GameEvent = { type: "pixelsChangedEvent" } & PixelsChangedEvent;

export type PixelsChangedEvent = {
  state: number;
  newState: number;
  changes: PixelColorChange[];
};

export type PixelColorChange = {
  row: number;
  column: number;
  oldColor: number;
  newColor: number;
};
