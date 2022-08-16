import React from "react";
import {useServerConfig} from "providers/server/serverConfig";
import {fetchWithRetry} from "../request/fetchClusterInfo";
import {Cluster, PublicKey} from "@solana/web3.js";

export interface ClusterConfig {
  cluster: Cluster | "custom";
  rpcUrl: string;
  programId: PublicKey;
  gameAccount: PublicKey;
}

export enum ConfigStatus {
  Initialized,
  Fetching,
  Ready,
  Failure,
}

interface State {
  status: ConfigStatus;
  config?: ClusterConfig;
}

interface Initialized {
  status: ConfigStatus.Initialized;
  config: ClusterConfig;
}

interface Fetching {
  status: ConfigStatus.Fetching;
}

interface Ready {
  status: ConfigStatus.Ready;
}

interface Failure {
  status: ConfigStatus.Failure;
  config?: undefined;
}

export type Action = Initialized | Fetching | Ready | Failure;
export type Dispatch = (action: Action) => void;

function configReducer(state: State, action: Action): State {
  switch (action.status) {
    case ConfigStatus.Ready:
    case ConfigStatus.Initialized: {
      return { ...state, ...action };
    }
    case ConfigStatus.Failure: {
      if (state.status === ConfigStatus.Fetching) {
        return { ...state, ...action };
      } else {
        return state;
      }
    }
    case ConfigStatus.Fetching: {
      return {
        ...state,
        ...action,
      };
    }
  }
}

const StateContext = React.createContext<State | undefined>(undefined);
const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

type ApiProviderProps = { children: React.ReactNode };
export function HttpProvider({ children }: ApiProviderProps) {
  const [state, dispatch] = React.useReducer(configReducer, {
    status: ConfigStatus.Fetching,
  });

  const { httpUrl } = useServerConfig();
  const httpUrlRef = React.useRef(httpUrl);
  React.useEffect(() => {
    httpUrlRef.current = httpUrl;
    fetchWithRetry(dispatch, httpUrlRef);
  }, [httpUrl]);

  React.useEffect(() => {
    httpUrlRef.current = httpUrl;
  }, [httpUrl]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useClusterConfig(): ClusterConfig | undefined {
  const context = React.useContext(StateContext);
  if (!context) {
    throw new Error(`useServerConfig must be used within a ApiProvider`);
  }
  return context.config;
}

