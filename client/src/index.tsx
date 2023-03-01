import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "styles/index.scss";

import App from "./app";
import { BoardStateProvider } from "providers/board/boardState";
import { GameStateProvider } from "providers/gameState";
import { WalletProvider } from "./providers/wallet";
import { BoardConfigProvider } from "./providers/board/boardConfig";
import { BoardHistoryProvider } from "./providers/board/boardHistory";
import { WebSocketProvider } from "providers/server/webSocket";
import { ServerConfigProvider } from "./providers/server/serverConfig";
import { AboutProvider } from "./providers/about/about";
import { NotificationsProvider } from "./providers/notifications/notifications";
import { PendingTransactionProvider } from "./providers/transactions/pendingTransaction";
import { CurrentColorProvider } from "providers/color/currentColor";

ReactDOM.render(
  <BrowserRouter>
    <NotificationsProvider>
      <ServerConfigProvider>
        <WebSocketProvider>
          <WalletProvider>
            <BoardConfigProvider>
              <BoardStateProvider>
                <BoardHistoryProvider>
                  <GameStateProvider>
                    <PendingTransactionProvider>
                      <AboutProvider>
                        <CurrentColorProvider>
                          <App />
                        </CurrentColorProvider>
                      </AboutProvider>
                    </PendingTransactionProvider>
                  </GameStateProvider>
                </BoardHistoryProvider>
              </BoardStateProvider>
            </BoardConfigProvider>
          </WalletProvider>
        </WebSocketProvider>
      </ServerConfigProvider>
    </NotificationsProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
