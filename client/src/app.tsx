import * as React from "react";

import {LoadingModal} from "components/LoadingModal";
import {useGameState} from "providers/game";
import {GameCanvas} from "./components/GameCanvas";
import {PixelColorPicker, SelectedPixel} from "./components/PixelColorPicker";
import {Dashboard} from "components/Dashboard";
import {useState} from "react";

export default function App() {
  const gameState = useGameState();
  const showLoadingModal = gameState.loadingPhase !== "complete";
  const [selectedPixel, setSelectedPixel] = useState<SelectedPixel>();

  return (
    <div className="main-content">
      <GameCanvas onPixelClicked={(pixel) => setSelectedPixel(pixel)}/>
      <Dashboard onMouseDown={() => setSelectedPixel(undefined)}/>
      <PixelColorPicker selectedPixel={selectedPixel} close={() => setSelectedPixel(undefined)}/>
      <LoadingModal show={showLoadingModal} phase={gameState.loadingPhase}/>
    </div>
  );
}