import { PixelCoordinates } from "../../model/pixelCoordinates";
import React from "react";
import { areEqual } from "../../model/boardState";
import { MAX_CHANGES_PER_TRANSACTION } from "../../request/changePixels";
import { buildInfoNotification } from "../../model/notification";
import { getIndexOfColor } from "../../utils/colorUtils";
import {
  useAddOrDeleteChangedPixel,
  usePendingTransaction,
} from "../../providers/transactions/pendingTransaction";
import {
  useAddNotification,
  useNotificationsState,
} from "../../providers/notifications/notifications";
import { useCurrentPixelColorState } from "../../providers/color/currentColor";

export type ChangeOrCancelPixelAction = (
  pixelCoordinates: PixelCoordinates,
  isDrawingMode: boolean
) => void;

export function useChangeOrCancelPixel(): ChangeOrCancelPixelAction {
  const { changedPixels } = usePendingTransaction();
  const { addChangedPixel, deleteChangedPixel } = useAddOrDeleteChangedPixel();
  const notifications = useNotificationsState();
  const addNotification = useAddNotification();
  const currentPixelColor = useCurrentPixelColorState()[0];

  return React.useCallback(
    (pixelCoordinates: PixelCoordinates, isDrawingMode) => {
      const isAlreadyChanged = changedPixels.some((changed) =>
        areEqual(pixelCoordinates, changed.coordinates)
      );
      if (isAlreadyChanged && !isDrawingMode) {
        deleteChangedPixel(pixelCoordinates);
        return;
      }
      if (changedPixels.length === MAX_CHANGES_PER_TRANSACTION) {
        const notificationTitle = "Maximum changes reached";
        const isAlreadyShowing = notifications.some(
          (notification) => notification.title === notificationTitle
        );
        if (!isAlreadyShowing) {
          addNotification(
            buildInfoNotification(notificationTitle, {
              type: "maximumChangesReached",
              limit: MAX_CHANGES_PER_TRANSACTION,
            })
          );
        }
        return;
      }

      addChangedPixel({
        coordinates: pixelCoordinates,
        newColor: getIndexOfColor(currentPixelColor),
      });
    },
    [
      changedPixels,
      deleteChangedPixel,
      addChangedPixel,
      currentPixelColor,
      notifications,
      addNotification,
    ]
  );
}
