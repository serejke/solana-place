import * as React from "react";
import {GithubPicker} from 'react-color';
import {getColorIndexFromPickerResult, getColorsForPicker} from "../utils/colorUtils";
import {CSSProperties} from "react";
import {Classes} from 'reactcss'
import {GithubPickerStylesProps} from "react-color/lib/components/github/Github";
import {areEqual} from "../model/boardState";
import {MAX_CHANGES_PER_TRANSACTION} from "request/changePixels";
import {PixelCoordinates} from "../model/pixelCoordinates";
import {useAddOrDeleteChangedPixel, usePendingTransaction} from "../providers/transactions/pendingTransaction";

const GITHUB_PICKER_TRIANGLE_SIZE = 16;

export type SelectedPixel = {
  pixelCoordinates: PixelCoordinates,
  popupPosition: { clientX: number, clientY: number }
}

type PixelColorPickerProps = {
  selectedPixel: SelectedPixel | undefined,
  close: () => void
};

export function PixelColorPicker({selectedPixel, close}: PixelColorPickerProps) {
  const {addChangedPixel, deleteChangedPixel} = useAddOrDeleteChangedPixel();
  const {changedPixels, pendingTransaction} = usePendingTransaction();

  const isAlreadyChanged = selectedPixel && changedPixels.some(pixel => areEqual(pixel.coordinates, selectedPixel.pixelCoordinates));

  const isPendingTransaction = pendingTransaction !== null

  React.useEffect(() => {
    if (isAlreadyChanged && !isPendingTransaction) {
      deleteChangedPixel(selectedPixel.pixelCoordinates);
      close();
    }
  }, [isAlreadyChanged, isPendingTransaction, selectedPixel, deleteChangedPixel, close])

  const canChangeMore = changedPixels.length < MAX_CHANGES_PER_TRANSACTION;

  if (!selectedPixel || isAlreadyChanged || isPendingTransaction) {
    return null;
  }

  const popover: CSSProperties = {
    position: 'absolute',
    zIndex: 2,
    left: selectedPixel.popupPosition.clientX - GITHUB_PICKER_TRIANGLE_SIZE / 2,
    top: selectedPixel.popupPosition.clientY + GITHUB_PICKER_TRIANGLE_SIZE / 2
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
            addChangedPixel({
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