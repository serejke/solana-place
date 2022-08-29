import React from "react";

import {useGameState} from "providers/gameState";
import {ClipLoader} from "react-spinners";

export function LoadingModal() {
  const phase = useGameState().loadingPhase;
  if (phase === "complete") {
    return null;
  }

  let loadingText: string;
  switch (phase) {
    case "config":
      loadingText = "Initializing";
      break;
    case "initial-state":
      loadingText = "Loading game state"
      break;
    default:
      loadingText = "Loading";
      break;
  }

  return (
    <div className="loading-modal">
      <ClipLoader className="loading-modal-spinner" cssOverride={{
        width: "1.5rem",
        height: "1.5rem"
      }}/>
      <span className="loading-modal-status">{loadingText}…</span>
    </div>
  );
}
