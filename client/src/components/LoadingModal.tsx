import React from "react";

import {LoadingPhase} from "providers/game";
import {ClipLoader} from "react-spinners";

export function LoadingModal({show, phase}: { show: boolean; phase?: LoadingPhase; }) {
  if (!show) {
    return null;
  }

  let loadingText: string = "";
  switch (phase) {
    case "complete":
      return null;
    case "wallet":
      loadingText = "Loading wallet";
      break;
    case "connection":
    case "config":
      loadingText = "Initializing";
      break;
    case "initial-state":
      loadingText = "Loading game state"
      break;
    case "socket":
      loadingText = "Connecting to the server";
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
