import React from "react";

import {GameStateLoadingPhase} from "providers/gameState";
import {ClipLoader} from "react-spinners";

export function LoadingModal({show, phase}: { show: boolean; phase?: GameStateLoadingPhase; }) {
  if (!show) {
    return null;
  }

  let loadingText: string = "";
  switch (phase) {
    case "complete":
      return null;
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
