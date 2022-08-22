import React from "react";
import {serverUrl} from "request/serverUrls";
import {fetchClusterInfo} from "../../request/fetchClusterInfo";
import {ClusterConfig} from "../../model/clusterConfig";
import {ClusterConfigState, clusterConfigReducer, ConfigStatus, Dispatch} from "../../reducers/clusterConfigReducer";

const Context = React.createContext<ClusterConfigState | undefined>(undefined);
const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

export function ClusterConfigProvider({children}: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(clusterConfigReducer, {
    status: ConfigStatus.Fetching,
  });

  React.useEffect(() => {
    fetchClusterInfo(dispatch, serverUrl)
      .catch(console.error);
  }, []);

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </Context.Provider>
  );
}

export function useClusterConfig(): ClusterConfig | undefined {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(`useServerConfig must be used within a ApiProvider`);
  }
  return context.config;
}

