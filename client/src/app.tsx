import * as React from "react";

import {LoadingModal} from "components/LoadingModal";
import {useGameState} from "providers/game";
import {GameCanvas} from "./components/GameCanvas";
import {PixelColorPicker} from "./components/PixelColorPicker";
import { Dashboard } from "components/Dashboard";

export default function App() {
  const gameState = useGameState();
  const showLoadingModal = gameState.loadingPhase !== "complete";

  return (
    <div className="main-content">
      <GameCanvas/>
      {!showLoadingModal && <Dashboard/>}
      <PixelColorPicker />
      <LoadingModal show={showLoadingModal} phase={gameState.loadingPhase} />
    </div>
  );
}