import React from "react";

import {useClusterConfig} from "providers/server/cluster";
import {useSocket} from "providers/server/socket";
import {useConnection} from "./connection";
import {useBoardState} from "./board/board";

export type LoadingPhase =
  | "connection"
  | "socket"
  | "config"
  | "wallet"
  | "initial-state"
  | "complete";

export interface GameState {
  loadingPhase: LoadingPhase;
}

const GameStateContext = React.createContext<GameState | undefined>(undefined);

type Props = { children: React.ReactNode };
export function GameStateProvider({ children }: Props) {
  const connection = useConnection();
  const clusterConfig = useClusterConfig();
  const socket = useSocket();
  const boardState = useBoardState();
  const loadingPhase: LoadingPhase = React.useMemo(() => {
    if (!connection) return "connection";
    if (!clusterConfig) return "config";
    if (!socket) return "socket";
    if (!boardState) return "initial-state";
    return "complete";
  }, [connection, clusterConfig, socket, boardState]);

  const gameState: GameState = React.useMemo(() => ({ loadingPhase }), [loadingPhase]);

  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = React.useContext(GameStateContext);
  if (!context) {
    throw new Error(`useGameState must be used within a GameStateProvider`);
  }
  return context;
}
