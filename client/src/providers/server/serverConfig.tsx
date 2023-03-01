import React from "react";
import { serverUrl } from "request/serverUrls";
import { fetchServerInfo } from "../../request/fetchServerInfo";
import { ServerConfig } from "../../model/serverConfig";
import {
  ServerConfigState,
  ConfigStatus,
} from "../../reducers/serverConfigReducer";

const Context = React.createContext<ServerConfigState | undefined>(undefined);

export function ServerConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<ServerConfigState>({
    status: ConfigStatus.Fetching,
  });

  React.useEffect(() => {
    fetchServerInfo(setState, serverUrl).catch(console.error);
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useServerConfig(): ServerConfig | undefined {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(`useServerConfig must be used within a ApiProvider`);
  }
  return context.config;
}
