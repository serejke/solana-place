import {ClusterConfig} from "../model/clusterConfig";

export enum ConfigStatus {
  Initialized,
  Fetching,
  Ready,
  Failure,
}

export interface ClusterConfigState {
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

export function clusterConfigReducer(state: ClusterConfigState, action: Action): ClusterConfigState {
  switch (action.status) {
    case ConfigStatus.Ready:
    case ConfigStatus.Initialized: {
      return {...state, ...action};
    }
    case ConfigStatus.Failure: {
      if (state.status === ConfigStatus.Fetching) {
        return {...state, ...action};
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