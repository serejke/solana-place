import * as React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import "styles/index.scss";

import App from "./app";
import {BoardStateProvider} from "providers/board/board";
import {GameStateProvider} from "providers/game";
import {ClientConfigProvider} from "providers/config";
import {WalletProvider} from "./providers/wallet";
import {BoardConfigProvider} from "./providers/board/config";
import {BoardHistoryProvider} from "./providers/board/history";
import { WebSocketProvider } from "providers/server/socket";
import {ClusterConfigProvider} from "./providers/server/cluster";

ReactDOM.render(
  <ClientConfigProvider>
    <BrowserRouter>
      <ClusterConfigProvider>
        <WebSocketProvider>
          <WalletProvider>
            <BoardConfigProvider>
              <BoardStateProvider>
                <BoardHistoryProvider>
                  <GameStateProvider>
                    <App/>
                  </GameStateProvider>
                </BoardHistoryProvider>
              </BoardStateProvider>
            </BoardConfigProvider>
          </WalletProvider>
        </WebSocketProvider>
      </ClusterConfigProvider>
    </BrowserRouter>
  </ClientConfigProvider>,
  document.getElementById("root")
);
