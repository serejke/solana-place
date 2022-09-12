import {useNotificationsState, useSetNotifications} from "../providers/notifications/notifications";
import {Notification} from "../model/notification";
import {TransactionSignature} from "@solana/web3.js";
import {SHORTENED_SYMBOL, shortenTransactionSignature} from "../utils/presentationUtils";
import {ExplorerTransactionLink} from "./ExplorerTransactionLink";
import React from "react";
import {useAddOrDeleteChangedPixel} from "../providers/transactions/pendingTransaction";

export function Notifications() {
  const notifications = useNotificationsState();
  return (
    <div className="notifications">
      {notifications.map(notification => <NotificationPlate key={notification.id} notification={notification}/>)}
    </div>
  )
}

type NotificationPlateProps = {
  notification: Notification
}

function NotificationPlate({notification}: NotificationPlateProps) {
  const notificationClass = notification.level.toLowerCase();
  const title = notification.title;
  const content = notification.content;
  let contentToRender = null;
  switch (content.type) {
    case "string":
      contentToRender = content.content;
      break
    case "waitingForTransaction":
      const transactionSignature = content.transactionSignature;
      contentToRender = <WaitingForTransactionNotification transactionSignature={transactionSignature}/>;
      break
    case "transactionWasDropped":
      contentToRender = <TransactionWasDroppedNotification transactionSignature={content.transactionSignature}
                                                           timeout={content.timeout}/>;
      break
    case "maximumChangesReached":
      contentToRender = <MaximumChangesReachedNotification limit={content.limit}/>
      break;
  }
  return (
    <div className={`notification notification-${notificationClass}`}>
      <div className="notification-title">{title}</div>
      <div className="notification-content">{contentToRender}</div>
    </div>
  )
}

function TransactionWasDroppedNotification(
  {
    transactionSignature,
    timeout
  }: { transactionSignature: TransactionSignature, timeout: number }
) {
  return (
    <div>
      Transaction {shortenTransactionSignature(transactionSignature)} has not been confirmed in {timeout / 1000}{' '}
      seconds and has probably been dropped by the cluster. Try sending it again...
      <ExplorerTransactionLink signature={transactionSignature} className="link-icon-center-aligned"/>
    </div>
  )
}

function WaitingForTransactionNotification({transactionSignature}: { transactionSignature: TransactionSignature }) {
  return (
    <div>
      Waiting for transaction {shortenTransactionSignature(transactionSignature)} to confirm{SHORTENED_SYMBOL}
      <ExplorerTransactionLink signature={transactionSignature} className="link-icon-center-aligned"/>
    </div>
  )
}

function MaximumChangesReachedNotification({limit}: { limit: number }) {
  const {deleteAllChangedPixels} = useAddOrDeleteChangedPixel();
  const setNotifications = useSetNotifications();
  const onClick = React.useCallback(() => {
    deleteAllChangedPixels()
    setNotifications((notifications) =>
      notifications.filter(notification => notification.content.type !== "maximumChangesReached")
    );
  }, [deleteAllChangedPixels, setNotifications]);
  return (
    <div>
      Maximum of {limit} changes are allowed in a single transaction.
      {' '}<span className="link-span" onClick={onClick}>Clear all?</span>
    </div>
  )
}