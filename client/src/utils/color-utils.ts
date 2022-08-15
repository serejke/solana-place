import {ColorResult, HSLColor} from "react-color";

const ALL_COLORS: string[] = [
  'hsl(0,100%,100%)',
  'hsl(0,100%,66%)',
  'hsl(17,100%,66%)',
  'hsl(48,100%,66%)',
  'hsl(121,100%,66%)',
  'hsl(186,100%,66%)',
  'hsl(211,85%,66%)',
  'hsl(218,100%,66%)',
  'hsl(261,100%,66%)',
  'hsl(1,69%,75%)',
  'hsl(14,85%,87%)',
  'hsl(50,97%,87%)',
  'hsl(128,35%,82%)',
  'hsl(184,30%,80%)',
  'hsl(209,74%,87%)',
  'hsl(216,69%,85%)',
  'hsl(257,87%,88%)'
]

export function getColorsForPicker(): string[] {
  return ALL_COLORS;
}

export function getColorIndexFromPickerResult(color: ColorResult): number | undefined {
  if (color.hex === "#ffffff") return 0;
  const hslString = hslColor(color.hsl);
  const colorIndex = ALL_COLORS.findIndex((c) => c === hslString);
  return colorIndex < 0 ? undefined : colorIndex + 1;
}

export function getColorByIndex(index: number): string | null {
  if (index === 0) {
    return null;
  }
  if (index > ALL_COLORS.length) {
    console.log("Index of color is more than the number of colors");
    return null;
  }
  return ALL_COLORS[index - 1];
}

function hslColor(color: HSLColor): string {
  return 'hsl(' + Math.round(color.h) + ',' + Math.round(color.s * 100) + '%,' + Math.round(color.l * 100) + '%)';
}

export const HIGHLIGHTED_STROKE_WIDTH = 3;

export const HIGHLIGHTED_COLOR = "blue";
export const GRID_COLOR = "lightgray";
export const CHANGED_COLOR = "black";
export const UNOCCUPIED_COLOR = "whitesmoke";
export const HOVERED_PIXEL_COLOR = "red";