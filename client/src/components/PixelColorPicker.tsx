import * as React from "react";
import {GithubPicker} from 'react-color';
import {
  useSelectedPixel,
  useSelectPixel,
} from "providers/board/selected";
import {getColorIndexFromPickerResult, getColorsForPicker} from "../utils/color-utils";
import {CSSProperties} from "react";
import {Classes} from 'reactcss'
import {GithubPickerStylesProps} from "react-color/lib/components/github/Github";
import {useBoardDispatch, useBoardState} from "../providers/board/board";
import {areEqual} from "../providers/board/state";
import { MAX_CHANGES_PER_TRANSACTION } from "providers/board/changePixels";

const GITHUB_PICKER_TRIANGLE_SIZE = 16;

export function PixelColorPicker() {
  const selectedPixel = useSelectedPixel();
  const selectPixel = useSelectPixel();
  const boardState = useBoardState();
  const boardDispatch = useBoardDispatch();
  const closePicker = React.useCallback(() => selectPixel(undefined), [selectPixel]);

  React.useEffect(() => {
    if (!selectedPixel) return;
    if (!boardState) return;
    const isAlreadyChanged = boardState.changed.some(pixel => areEqual(pixel.coordinates, selectedPixel.pixelCoordinates));
    if (isAlreadyChanged) {
      boardDispatch({
        type: "deleteChangedPixel",
        coordinates: selectedPixel.pixelCoordinates
      })
      closePicker();
    }
  }, [selectedPixel, boardState, boardDispatch, closePicker])

  const canChangeMore = boardState && boardState.changed.length < MAX_CHANGES_PER_TRANSACTION;

  if (!selectedPixel) {
    return null;
  }

  const popover: CSSProperties = {
    position: 'absolute',
    zIndex: 2,
    left: selectedPixel.canvasPosition.x - GITHUB_PICKER_TRIANGLE_SIZE / 2,
    top: selectedPixel.canvasPosition.y + GITHUB_PICKER_TRIANGLE_SIZE / 2
  }

  const styles: Partial<Classes<GithubPickerStylesProps>> = {
    'top-left-triangle': {
      triangle: {
        left: 1
      },
      triangleShadow: {
        left: 0
      }
    }
  }

  return (
    <div style={popover} className="color-picker">
      {canChangeMore
        ? <GithubPicker
          styles={styles}
          colors={getColorsForPicker()}
          onChangeComplete={(color) => {
            const colorIndex = getColorIndexFromPickerResult(color);
            if (colorIndex === undefined) {
              console.error("Unknown color", color);
              closePicker();
              return;
            }
            closePicker();
            boardDispatch({
              type: "changePixel",
              coordinates: selectedPixel.pixelCoordinates,
              newColor: colorIndex
            })
          }}
        />
        : <div className="popup-max-changes-per-transaction">Maximum of {MAX_CHANGES_PER_TRANSACTION} changes are allowed in a single transaction</div>
      }
    </div>
  )
}