import { ClusterConfig } from "../model/clusterConfig";
import React, { SetStateAction } from "react";

export enum ConfigStatus {
  Initialized,
  Fetching,
  Ready,
  Failure,
}

export type ClusterConfigState =
  | {
      status: ConfigStatus.Initialized;
      config: ClusterConfig;
    }
  | {
      status: ConfigStatus.Fetching;
      config?: undefined;
    }
  | {
      status: ConfigStatus.Ready;
      config?: undefined;
    }
  | {
      status: ConfigStatus.Failure;
      config?: undefined;
    };

export type SetClusterConfigState = React.Dispatch<
  SetStateAction<ClusterConfigState>
>;
