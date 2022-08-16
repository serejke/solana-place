import {ColorResult, HSLColor} from "react-color";

const ALL_COLORS2: string[] = [
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

const ALL_COLORS = [
  'hsl(0,0%,100%)',
  'hsl(0,0%,60%)',
  'hsl(0,0%,30%)',
  'hsl(6,89%,59%)',
  'hsl(34,100%,50%)',
  'hsl(52,100%,49%)',
  'hsl(61,100%,44%)',
  'hsl(75,100%,43%)',
  'hsl(179,50%,60%)',
  'hsl(197,100%,73%)',
  'hsl(248,100%,82%)',
  'hsl(299,100%,82%)',
  'hsl(0,0%,80%)',
  'hsl(0,0%,50%)',
  'hsl(0,0%,20%)',
  'hsl(9,82%,45%)',
  'hsl(31,100%,44%)',
  'hsl(47,100%,49%)',
  'hsl(64,100%,37%)',
  'hsl(87,100%,37%)',
  'hsl(180,76%,37%)',
  'hsl(198,100%,44%)',
  'hsl(249,100%,70%)',
  'hsl(299,100%,58%)',
  'hsl(0,0%,70%)',
  'hsl(0,0%,40%)',
  'hsl(0,0%,0%)',
  'hsl(2,100%,31%)',
  'hsl(25,100%,38%)',
  'hsl(38,100%,49%)',
  'hsl(64,100%,27%)',
  'hsl(150,51%,20%)',
  'hsl(182,82%,27%)',
  'hsl(207,100%,35%)',
  'hsl(271,49%,39%)',
  'hsl(305,79%,37%)'
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

export const HIGHLIGHTED_STROKE_WIDTH = 2;

export const HIGHLIGHTED_COLOR = "hsl(197,100%,73%)";
export const GRID_COLOR = "lightgray";
export const CHANGED_COLOR = "black";
export const UNOCCUPIED_COLOR = "whitesmoke";
export const HOVERED_PIXEL_COLOR = "hsl(9,82%,45%)";