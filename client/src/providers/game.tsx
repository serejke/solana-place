import React from "react";

import {useClusterConfig} from "providers/server/cluster";
import {useBoardState} from "./board/board";

export type LoadingPhase =
  | "config"
  | "initial-state"
  | "complete";

export interface GameState {
  loadingPhase: LoadingPhase;
}

const GameStateContext = React.createContext<GameState | undefined>(undefined);

type Props = { children: React.ReactNode };
export function GameStateProvider({ children }: Props) {
  const clusterConfig = useClusterConfig();
  const boardState = useBoardState();
  const loadingPhase: LoadingPhase = React.useMemo(() => {
    if (!clusterConfig) return "config";
    if (!boardState) return "initial-state";
    return "complete";
  }, [clusterConfig, boardState]);

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
