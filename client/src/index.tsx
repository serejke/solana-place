import * as React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import "styles/index.scss";

import App from "./app";
import {BoardStateProvider} from "providers/board/boardState";
import {GameStateProvider} from "providers/gameState";
import {WalletProvider} from "./providers/wallet";
import {BoardConfigProvider} from "./providers/board/boardConfig";
import {BoardHistoryProvider} from "./providers/board/boardHistory";
import { WebSocketProvider } from "providers/server/webSocket";
import {ClusterConfigProvider} from "./providers/server/clusterConfig";
import {ZoomingProvider} from "./providers/board/zooming";

ReactDOM.render(
  <BrowserRouter>
    <ClusterConfigProvider>
      <WebSocketProvider>
        <WalletProvider>
          <BoardConfigProvider>
            <BoardStateProvider>
              <BoardHistoryProvider>
                <GameStateProvider>
                  <ZoomingProvider>
                    <App/>
                  </ZoomingProvider>
                </GameStateProvider>
              </BoardHistoryProvider>
            </BoardStateProvider>
          </BoardConfigProvider>
        </WalletProvider>
      </WebSocketProvider>
    </ClusterConfigProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
