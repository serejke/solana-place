import { ColorResult } from "react-color";

export type PixelColor = string;

const ALL_COLORS: PixelColor[] = [
  "#ffffff",
  "#999999",
  "#4d4d4d",
  "#f34c39",
  "#ff9100",
  "#fad900",
  "#dde000",
  "#a4db00",
  "#66ccca",
  "#75d8ff",
  "#afa3ff",
  "#fda3ff",
  "#cccccc",
  "#808080",
  "#333333",
  "#d13115",
  "#e07400",
  "#fac400",
  "#b0bd00",
  "#68bd00",
  "#17a6a6",
  "#009de0",
  "#7d66ff",
  "#fb29ff",
  "#b3b3b3",
  "#666666",
  "#000000",
  "#9e0500",
  "#c25100",
  "#fa9e00",
  "#818a00",
  "#194d33",
  "#0c7a7d",
  "#0062b3",
  "#653394",
  "#a9149c",
];

export function getColorsForPicker(): PixelColor[] {
  return ALL_COLORS;
}

export function getColorIndexFromPickerResult(
  color: ColorResult
): number | undefined {
  const colorIndex = ALL_COLORS.findIndex((c) => c === color.hex);
  return colorIndex < 0 ? undefined : colorIndex + 1;
}

export function getIndexOfColor(pixelColor: PixelColor): number {
  return ALL_COLORS.indexOf(pixelColor) + 1;
}

export function getColorByIndex(index: number): PixelColor | null {
  if (index === 0) {
    return null;
  }
  if (index > ALL_COLORS.length) {
    console.log(
      `Index of color ${index} is more than the number of colors ${ALL_COLORS.length}`
    );
    return null;
  }
  return ALL_COLORS[index - 1];
}
export const HIGHLIGHTED_COLOR = "#75d8ff";
export const GRID_COLOR = "lightgray";
export const CHANGED_COLOR = "green";
export const PENDING_COLOR = "yellow";
