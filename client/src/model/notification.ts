import {RequestError} from "../request/requestError";
import {TransactionSignature} from "@solana/web3.js";

export enum NotificationLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type NotificationContent = {
  type: "string",
  content: string
} | {
  type: "waitingForTransaction",
  transactionSignature: TransactionSignature
} | {
  type: "transactionWasDropped",
  transactionSignature: TransactionSignature,
  timeout: number
} | {
  type: "maximumChangesReached",
  limit: number
};

export type NotificationExpiration = {
  type: "after",
  duration: number
}

export type Notification = {
  id: string,
  createdAt: number,
  expiration: NotificationExpiration,
  level: NotificationLevel;
  title: string,
  content: NotificationContent
}

let notificationId = 0;
export function createNotificationId(): string {
  return ++notificationId + "";
}

export const DEFAULT_NOTIFICATION_EXPIRATION: NotificationExpiration = {
  type: "after",
  duration: 5000
};

export function buildInfoNotification(title: string, notificationContent: NotificationContent): Notification {
  return {
    id: createNotificationId(),
    createdAt: Date.now(),
    expiration: DEFAULT_NOTIFICATION_EXPIRATION,
    title,
    level: NotificationLevel.INFO,
    content: notificationContent
  }
}

export function buildWarnNotification(
  title: string,
  notificationContent: NotificationContent,
  expiration: NotificationExpiration = DEFAULT_NOTIFICATION_EXPIRATION
): Notification {
  return {
    id: createNotificationId(),
    createdAt: Date.now(),
    expiration,
    title,
    level: NotificationLevel.WARN,
    content: notificationContent
  }
}

export function buildSuccessNotification(title: string, notificationContent: NotificationContent): Notification {
  return {
    id: createNotificationId(),
    createdAt: Date.now(),
    expiration: DEFAULT_NOTIFICATION_EXPIRATION,
    title,
    level: NotificationLevel.SUCCESS,
    content: notificationContent
  }
}

export function buildErrorNotification(title: string, e: any): Notification {
  let details: string;
  if (e instanceof RequestError) {
    const errorBody = e.errorBody;
    if (errorBody) {
      if (errorBody.message.includes("Attempt to debit an account but found no record of a prior credit")) {
        details = "Your wallet has insufficient funds"
      } else {
        details = errorBody.message
      }
    } else {
      details = e.message;
    }
  } else if (e instanceof Error) {
    details = e.message;
  } else {
    details = "Please check the console logs and report the error to Discord https://discord.gg/eSvvbHe86R";
  }
  return {
    id: createNotificationId(),
    createdAt: Date.now(),
    expiration: DEFAULT_NOTIFICATION_EXPIRATION,
    level: NotificationLevel.ERROR,
    title,
    content: {
      type: "string",
      content: details
    }
  }
}