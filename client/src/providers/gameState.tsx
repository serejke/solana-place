import React from "react";

import { useServerConfig } from "providers/server/serverConfig";
import { useBoardState } from "./board/boardState";

export type GameStateLoadingPhase = "config" | "initial-state" | "complete";

export interface GameState {
  loadingPhase: GameStateLoadingPhase;
}

const GameStateContext = React.createContext<GameState | undefined>(undefined);

type Props = { children: React.ReactNode };
export function GameStateProvider({ children }: Props) {
  const serverConfig = useServerConfig();
  const boardState = useBoardState();
  const loadingPhase: GameStateLoadingPhase = React.useMemo(() => {
    if (!serverConfig) return "config";
    if (!boardState) return "initial-state";
    return "complete";
  }, [serverConfig, boardState]);

  const gameState: GameState = React.useMemo(
    () => ({ loadingPhase }),
    [loadingPhase]
  );

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
