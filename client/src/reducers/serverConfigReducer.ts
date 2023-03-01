import { ServerConfig } from "../model/serverConfig";
import React, { SetStateAction } from "react";

export enum ConfigStatus {
  Initialized,
  Fetching,
  Ready,
  Failure,
}

export type ServerConfigState =
  | {
      status: ConfigStatus.Initialized;
      config: ServerConfig;
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

export type SetServerConfigState = React.Dispatch<
  SetStateAction<ServerConfigState>
>;
