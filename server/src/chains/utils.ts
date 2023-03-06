export function parseColors(
  height: number,
  width: number,
  allColors: Uint8Array
): number[][] {
  const colors: number[][] = new Array(height)
    .fill(0)
    .map(() => new Array(width).fill(0));
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      colors[row][column] = allColors[row * width + column];
    }
  }
  return colors;
}
