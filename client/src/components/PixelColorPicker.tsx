import * as React from "react";
import {GithubPicker} from 'react-color';
import {getColorIndexFromPickerResult, getColorsForPicker} from "../utils/colorUtils";
import {CSSProperties} from "react";
import {Classes} from 'reactcss'
import {GithubPickerStylesProps} from "react-color/lib/components/github/Github";
import {useBoardDispatch, useBoardState} from "../providers/board/boardState";
import {areEqual} from "../model/boardState";
import {MAX_CHANGES_PER_TRANSACTION} from "request/changePixels";
import {CanvasPosition} from "./GameCanvas";
import {PixelCoordinates} from "../model/pixelCoordinates";

const GITHUB_PICKER_TRIANGLE_SIZE = 16;

export type SelectedPixel = {
  pixelCoordinates: PixelCoordinates,
  canvasPosition: CanvasPosition
}

type PixelColorPickerProps = {
  selectedPixel: SelectedPixel | undefined,
  close: () => void
};

export function PixelColorPicker({selectedPixel, close}: PixelColorPickerProps) {
  const boardState = useBoardState();
  const boardDispatch = useBoardDispatch();

  const isAlreadyChanged = boardState
    && selectedPixel
    && boardState.changed.some(pixel => areEqual(pixel.coordinates, selectedPixel.pixelCoordinates));

  React.useEffect(() => {
    if (isAlreadyChanged) {
      boardDispatch({
        type: "deleteChangedPixel",
        coordinates: selectedPixel.pixelCoordinates
      })
      close();
    }
  }, [isAlreadyChanged, selectedPixel, boardDispatch, close])

  const canChangeMore = boardState && boardState.changed.length < MAX_CHANGES_PER_TRANSACTION;

  if (!selectedPixel || isAlreadyChanged) {
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
          width="313px"
          styles={styles}
          colors={getColorsForPicker()}
          onChangeComplete={(color) => {
            const colorIndex = getColorIndexFromPickerResult(color);
            if (colorIndex === undefined) {
              console.error("Unknown color", color);
              close();
              return;
            }
            close();
            boardDispatch({
              type: "changePixel",
              coordinates: selectedPixel.pixelCoordinates,
              newColor: colorIndex
            })
          }}
        />
        : (
          <div className="popup-max-changes-per-transaction">
            Maximum of {MAX_CHANGES_PER_TRANSACTION} changes are allowed in a single transaction
          </div>
        )
      }
    </div>
  )
}