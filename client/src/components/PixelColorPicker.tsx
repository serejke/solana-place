import * as React from "react";
import {ColorResult, GithubPicker} from 'react-color';
import {getColorByIndex, getColorIndexFromPickerResult, getColorsForPicker} from "../utils/colorUtils";
import {CSSProperties} from "react";
import {Classes} from 'reactcss'
import {GithubPickerStylesProps} from "react-color/lib/components/github/Github";
import {useCurrentPixelColorState} from "../providers/color/currentColor";
import {useColorPickerStateAndActions} from "../providers/color/colorPicker";

const GITHUB_PICKER_TRIANGLE_SIZE = 16;

export function PixelColorPicker() {
  const setCurrentPixelColor = useCurrentPixelColorState()[1];
  const {colorPickerPosition, closeColorPicker} = useColorPickerStateAndActions();

  const onColorPicked = React.useCallback((color: ColorResult) => {
    const colorIndex = getColorIndexFromPickerResult(color);
    if (colorIndex === undefined) {
      console.error("Unknown color", color);
      closeColorPicker();
      return;
    }
    closeColorPicker();
    setCurrentPixelColor(getColorByIndex(colorIndex)!);
  }, [setCurrentPixelColor, closeColorPicker]);

  if (!colorPickerPosition) {
    return null;
  }

  const popover: CSSProperties = {
    position: 'absolute',
    zIndex: 2,
    left: colorPickerPosition.popupPosition.clientX - GITHUB_PICKER_TRIANGLE_SIZE / 2,
    top: colorPickerPosition.popupPosition.clientY + GITHUB_PICKER_TRIANGLE_SIZE / 2
  }

  const styles: Partial<Classes<GithubPickerStylesProps>> = {
    'top-left-triangle': {
      triangle: {
        left: 1,
        pointerEvents: "none"
      },
      triangleShadow: {
        left: 0,
        pointerEvents: "none"
      }
    }
  }

  return (
    <div style={popover} className="color-picker">
      <GithubPicker
        width="313px"
        styles={styles}
        colors={getColorsForPicker()}
        onChangeComplete={onColorPicked}
      />
    </div>
  )
}