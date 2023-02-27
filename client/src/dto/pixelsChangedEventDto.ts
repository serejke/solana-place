export type PixelsChangedEventDto = {
  state: number;
  newState: number;
  changes: PixelColorChangeDto[];
};

export type PixelColorChangeDto = {
  row: number;
  column: number;
  oldColor: number;
  newColor: number;
};
