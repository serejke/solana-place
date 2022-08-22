export type GameEvent = { type: "pixelChangedEvent" } & PixelChangedEvent;

export type PixelChangedEvent = {
  state: number,
  row: number,
  column: number,
  oldColor: number,
  newColor: number
}