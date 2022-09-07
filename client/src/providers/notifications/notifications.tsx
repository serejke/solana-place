import * as React from "react";
import {Notification} from "../../model/notification";

type NotificationsState = Notification[];
type SetState = React.Dispatch<React.SetStateAction<NotificationsState>>;
type State = [NotificationsState, SetState];
const Context = React.createContext<State | undefined>(undefined);

export function NotificationsProvider({children}: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationsState>([]);
  React.useEffect(() => {
    const intervalId = setInterval(() => setNotifications(
        (currentNotifications) => currentNotifications.filter(n => !isExpiredNotification(n))
      ),
      500
    );
    return () => clearInterval(intervalId)
  }, [setNotifications]);
  return (
    <Context.Provider value={[notifications, setNotifications]}>
      {children}
    </Context.Provider>
  );
}

function isExpiredNotification(notification: Notification): boolean {
  const now = Date.now();
  const expiration = notification.expiration;
  switch (expiration.type) {
    case "after":
      return now > notification.createdAt + expiration.duration;
  }
}

export function useNotificationsState(): NotificationsState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useNotificationsState must be used within a NotificationsProvider`);
  }
  return state[0];
}

export function useSetNotifications(): SetState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useSetNotificationsState must be used within a NotificationsProvider`);
  }
  return state[1];
}

export type AddNotification = (notification: Notification) => void;

const MAX_NOTIFICATIONS = 5;

export function useAddNotification(): AddNotification {
  const setNotifications = useSetNotifications();
  return React.useCallback((notification) => {
    setNotifications((prevNotifications) =>
      [...prevNotifications, notification].slice(-MAX_NOTIFICATIONS)
    )
  }, [setNotifications]);
}