import React from "react";
import {Cluster} from "@solana/web3.js";
import {useLocation} from "react-router-dom";
import {isLocalHost} from "../../utils";
import {HttpProvider} from "./cluster";
import {SocketProvider} from "./socket";

type Server = Cluster | "custom";
export const DEFAULT_SERVER = isLocalHost() ? "custom" : "mainnet-beta";
const DEFAULT_CUSTOM_URL = `http://${window.location.hostname}:${
  process.env.PORT || 8080
}`;

function serverName(server: Server): string {
  switch (server) {
    case "mainnet-beta":
      return "Mainnet Beta";
    case "testnet":
      return "Testnet";
    case "devnet":
      return "Devnet";
    case "custom":
      return "Custom";
  }
}

function parseQuery(query: URLSearchParams): Server {
  const clusterParam = query.get("cluster");
  switch (clusterParam) {
    case "devnet":
      return "devnet";
    case "testnet":
      return "testnet";
    case "mainnet-beta":
      return "mainnet-beta";
    case "custom":
      return "custom";
    default:
      return DEFAULT_SERVER;
  }
}

type SetCustomUrl = React.Dispatch<React.SetStateAction<string>>;
type SetServer = React.Dispatch<React.SetStateAction<Server>>;
type ServerConfig = {
  server: Server;
  setServer: SetServer;
  httpUrl: string;
  webSocketUrl: string;
  setCustomUrl: SetCustomUrl;
};
const ServerContext = React.createContext<ServerConfig | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export function ServerConfigProvider({children}: ProviderProps) {
  const query = new URLSearchParams(useLocation().search);
  const serverParam = parseQuery(query);
  const [server, setServer] = React.useState<Server>(serverParam);
  const [customUrl, setCustomUrl] = React.useState<string>(DEFAULT_CUSTOM_URL);

  // Update state when query params change
  React.useEffect(() => {
    setServer(serverParam);
  }, [serverParam]);

  const state: ServerConfig = React.useMemo(() => {
    const httpUrl = getServerUrl(server, customUrl);
    const webSocketUrl = httpUrl.replace("http", "ws");

    return {
      server,
      httpUrl,
      webSocketUrl,
      name: serverName(server),
      setServer,
      setCustomUrl
    }
  }, [server, customUrl, setServer, setCustomUrl]);

  return (
    <ServerContext.Provider value={state}>
      <HttpProvider>
        <SocketProvider>{children}</SocketProvider>
      </HttpProvider>
    </ServerContext.Provider>
  );
}

function getServerUrl(server: Server, customUrl: string) {
  switch (server) {
    case "custom": {
      return customUrl;
    }
    default: {
      const useHttp = isLocalHost();
      let ending: string = server;
      if (server === "mainnet-beta") {
        ending = "mainnet";
      }
      return `${
        useHttp ? "http" : "https"
      }://solana-space-${ending}.herokuapp.com`;
    }
  }
}

export function useServerConfig(): ServerConfig {
  const state = React.useContext(ServerContext);
  if (!state) {
    throw new Error(`useServerConfig must be used within a ServerConfigProvider`);
  }
  return state;
}