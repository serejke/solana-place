import {useClientConfig} from "providers/config";
import * as React from "react";
import {websocketUrl} from "./server-config";

type SetSocket = React.Dispatch<React.SetStateAction<ServerSocket | undefined>>;
const SocketContext = React.createContext<WebSocket | undefined>(undefined);

type SocketMessageHandler = (data: any) => void;
type SetSocketMessageHandlers = React.Dispatch<React.SetStateAction<SocketMessageHandler[]>>;
const SocketMessageHandlersContext = React.createContext<[SocketMessageHandler[], SetSocketMessageHandlers] | undefined>(undefined);

type FailureCallback = (signature: string, reason: string) => void;
const FailureCallbackContext = React.createContext<React.MutableRefObject<FailureCallback> | undefined>(undefined);

type SetActiveUsers = React.Dispatch<React.SetStateAction<number>>;
const ActiveUsersContext = React.createContext<number | undefined>(undefined);

const SWITCH_URL_CODE = 4444;

type ServerSocket = {
  socket: WebSocket;
  id: number;
};

let socketCounter = 0;

type SocketProviderProps = { children: React.ReactNode };
export function WebSocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = React.useState<ServerSocket | undefined>(undefined);
  const [socketMessageHandlers, setSocketMessageHandlers] = React.useState<SocketMessageHandler[]>([]);
  const failureCallbackRef = React.useRef(() => {});
  const [activeUsers, setActiveUsers] = React.useState<number>(1);
  const { useTpu, rpcUrl } = useClientConfig();

  React.useEffect(() => {
    newSocket(websocketUrl, setSocket, setActiveUsers, socketMessageHandlers, failureCallbackRef);
  }, [setSocket, setActiveUsers, socketMessageHandlers, failureCallbackRef]);

  React.useEffect(() => {
    if (socket) {
      socket.socket.send(useTpu ? "tpu" : "rpc");
    }
  }, [socket, useTpu]);

  React.useEffect(() => {
    if (socket && rpcUrl) {
      socket.socket.send(rpcUrl);
    }
  }, [socket, rpcUrl]);

  React.useEffect(() => {
    setSocketMessageHandlers((handlers) => [
      ...handlers,
      (data) => {
        if ("activeUsers" in data) {
          setActiveUsers(data.activeUsers);
        }
      }
    ])
  }, [setSocketMessageHandlers, setActiveUsers])

  return (
    <SocketContext.Provider value={socket?.socket}>
      <SocketMessageHandlersContext.Provider value={[socketMessageHandlers, setSocketMessageHandlers]}>
        <ActiveUsersContext.Provider value={activeUsers}>
          <FailureCallbackContext.Provider value={failureCallbackRef}>
            {children}
          </FailureCallbackContext.Provider>
        </ActiveUsersContext.Provider>
      </SocketMessageHandlersContext.Provider>
    </SocketContext.Provider>
  );
}

function newSocket(
  webSocketUrl: string,
  setSocket: SetSocket,
  setActiveUsers: SetActiveUsers,
  socketMessageHandlers: SocketMessageHandler[],
  failureCallbackRef: React.MutableRefObject<FailureCallback>
): WebSocket | undefined {
  socketCounter++;
  const id = socketCounter;

  let socket: WebSocket;
  try {
    socket = new WebSocket(webSocketUrl);
  } catch (err) {
    return;
  }

  socket.onopen = () =>
    setSocket((serverSocket) => {
      if (!serverSocket || serverSocket.id <= id) {
        if (serverSocket && serverSocket.socket.readyState === WebSocket.OPEN) {
          serverSocket.socket.close(SWITCH_URL_CODE);
        }
        return { socket, id };
      } else {
        socket.close(SWITCH_URL_CODE);
        return serverSocket;
      }
    });

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    socketMessageHandlers.forEach((handler) => {
      handler(data);
    })
  };

  socket.onclose = async (event) => {
    setSocket((serverSocket) => {
      // Socket may have been updated already
      if (!serverSocket || serverSocket.id === id) {
        // Reconnect if close was not explicit
        if (event.code !== SWITCH_URL_CODE) {
          console.error("Socket closed, reconnecting...");
          setTimeout(() => {
            newSocket(
              webSocketUrl,
              setSocket,
              setActiveUsers,
              socketMessageHandlers,
              failureCallbackRef
            );
          }, 5000);
        }
        return undefined;
      }
      return serverSocket;
    });
  };

  socket.onerror = async () => {
    socket.close();
  };

  return socket;
}

export function useSocket() {
  return React.useContext(SocketContext);
}

export function useActiveUsers(): number {
  const context = React.useContext(ActiveUsersContext);
  if (!context) {
    throw new Error(`useActiveUsers must be used within a SocketProvider`);
  }

  return context;
}
export function useSocketMessageHandlers(): [SocketMessageHandler[], SetSocketMessageHandlers] {
  const context = React.useContext(SocketMessageHandlersContext);
  if (!context) {
    throw new Error(`useSocketMessageHandlers must be used within a SocketMessageHandlersContext`);
  }
  return context;
}