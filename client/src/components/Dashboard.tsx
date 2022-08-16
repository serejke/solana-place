import * as React from "react";
import {useClusterConfig} from "../providers/server/cluster";
import {useBoardState} from "../providers/board/board";
import {useBoardConfig, useSetBoardConfig} from "../providers/board/config";
import Toggle from "react-toggle";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import Draggable from "react-draggable"
import {changePixels} from "providers/board/changePixels";
import {useActiveUsers} from "../providers/server/socket";
import {useBoardHistory} from "../providers/board/history";
import {useHighlightPixel} from "../providers/board/highlighter";
import {getColorByIndex} from "../utils/color-utils";
import SolanaExplorerLogo from '../styles/icons/dark-solana-logo.svg';
import {useServerConfig} from "../providers/server/serverConfig";

export function Dashboard() {
  const httpUrl = useServerConfig().httpUrl;
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();

  const changedPixels = useBoardState()?.changed ?? [];

  const wallet = useWallet();
  const activeUsers = useActiveUsers();

  return (
    <Draggable>
      <div className="dashboard">
        <div className="dashboard-row">
          <div className="dashboard-item">
            {!wallet && <WalletMultiButton className="action-button"/>}
            {wallet
              && <button
                className="action-button"
                disabled={changedPixels.length === 0}
                onClick={() => {
                  changePixels(httpUrl, changedPixels, wallet)
                    .catch(console.error)
                  ;
                }}>Send</button>}
          </div>
          <div className="dashboard-item grid-toggle">
            <Toggle
              id="grid-toggle-id"
              defaultChecked={boardConfig.showGrid}
              icons={false}
              onChange={(e) => {
                setBoardConfig((prevConfig) => {
                  return {
                    ...prevConfig,
                    showGrid: e.target.checked
                  }
                })
              }}/>
            <label className="grid-toggle-label" htmlFor="grid-toggle-id">Show grid</label>
          </div>
          <div className="dashboard-item">
            Online: {activeUsers}
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-item">
            <BoardHistoryTable/>
          </div>
        </div>
      </div>
    </Draggable>
  );
}

function BoardHistoryExplorerLink({signature}: {signature: string}) {
  const clusterParam = useClusterParam();
  const explorerLink = (path: string) => `https://explorer.solana.com/${path}?${clusterParam}`;
  return <div className="board-history-cell">
    <a
      href={explorerLink("tx/" + signature)}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Explorer"
    >
      <img
        className="board-history-explorer-link"
        src={SolanaExplorerLogo}
        alt="Solana Explorer"
      />
    </a>
  </div>;
}

function BoardHistoryTable() {
  const boardHistory = useBoardHistory();
  const highlightPixel = useHighlightPixel();

  if (!boardHistory) {
    return null;
  }

  return <div className="board-history">
    <table className="board-history-table">
      <thead>
      <tr>
        <th>Change</th>
        <th>Cluster time</th>
        <th>Tx</th>
        <th>Sender</th>
        <th>Links</th>
      </tr>
      </thead>
      <tbody>
      {boardHistory.changes.map((change) => (
        <tr
          key={change.transactionDetails.signature + change.change.row + change.change.column}
          className="board-history-row"
          onMouseOut={() => highlightPixel(undefined)}
          onMouseOver={() => highlightPixel({
            pixelCoordinates: {
              row: change.change.row,
              column: change.change.column
            }
          })}
        >
          <td><BoardHistoryChangeArrow oldColor={change.change.oldColor} newColor={change.change.newColor}/></td>
          <td>{change.transactionDetails.timestamp}</td>
          <td>{change.transactionDetails.signature.slice(0, 7)}…</td>
          <td>{change.transactionDetails.sender.slice(0, 7)}…</td>
          <td><BoardHistoryExplorerLink signature={change.transactionDetails.signature}/></td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>;
}

function BoardHistoryChangeArrow({oldColor, newColor}: { oldColor: number, newColor: number }) {
  const oldColorString = getColorByIndex(oldColor) ?? "white";
  const newColorString = getColorByIndex(newColor) ?? "white";
  return (
    <div className="board-history-cell">
      <div className="board-history-pixel-plate"
           style={{background: oldColorString}}
      />
      <span className="board-history-change-arrow-symbol">→</span>
      <div className="board-history-pixel-plate"
           style={{background: newColorString}}
      />
    </div>
  );
}

function useClusterParam(): string | undefined {
  const clusterConfig = useClusterConfig();
  if (!clusterConfig) {
    return undefined;
  }
  const cluster = clusterConfig.cluster;
  const rpcUrl = clusterConfig.rpcUrl;
  switch (cluster) {
    case "mainnet-beta":
      return "";
    case "devnet":
      return "cluster=devnet"
    case "testnet":
      return "cluster=testnet"
    case "custom":
      return "cluster=custom&customUrl=" + rpcUrl
  }
}