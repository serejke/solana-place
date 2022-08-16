import * as React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import "styles/index.scss";

import App from "./app";
import {BoardStateProvider} from "providers/board/board";
import {GameStateProvider} from "providers/game";
import {ServerConfigProvider} from "providers/server/serverConfig";
import {ClientConfigProvider} from "providers/config";
import {WalletProvider} from "./providers/wallet";
import {BoardConfigProvider} from "./providers/board/config";
import {BoardHistoryProvider} from "./providers/board/history";

ReactDOM.render(
  <ClientConfigProvider>
    <BrowserRouter>
      <ServerConfigProvider>
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
      </ServerConfigProvider>
    </BrowserRouter>
  </ClientConfigProvider>,
  document.getElementById("root")
);