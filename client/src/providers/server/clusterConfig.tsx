import React from "react";
import { serverUrl } from "request/serverUrls";
import { fetchClusterInfo } from "../../request/fetchClusterInfo";
import { ClusterConfig } from "../../model/clusterConfig";
import {
  ClusterConfigState,
  ConfigStatus,
} from "../../reducers/clusterConfigReducer";

const Context = React.createContext<ClusterConfigState | undefined>(undefined);

export function ClusterConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<ClusterConfigState>({
    status: ConfigStatus.Fetching,
  });

  React.useEffect(() => {
    fetchClusterInfo(setState, serverUrl).catch(console.error);
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useClusterConfig(): ClusterConfig | undefined {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(`useServerConfig must be used within a ApiProvider`);
  }
  return context.config;
}
