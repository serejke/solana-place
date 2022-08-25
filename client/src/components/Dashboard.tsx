import * as React from "react";
import {useClusterConfig} from "../providers/server/clusterConfig";
import {useBoardState} from "../providers/board/boardState";
import {useBoardConfig, useSetBoardConfig} from "../providers/board/boardConfig";
import Toggle from "react-toggle";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import Draggable from "react-draggable"
import {changePixels} from "request/changePixels";
import {useActiveUsers, useIsOnline} from "../providers/server/webSocket";
import {useBoardHistory} from "../providers/board/boardHistory";
import {useHighlightPixel} from "../providers/board/highlightedPixel";
import {getColorByIndex} from "../utils/colorUtils";
import SolanaExplorerLogo from '../styles/icons/dark-solana-logo.svg';
import {serverUrl} from "../request/serverUrls";
import {displayTimestamp} from "../utils/date";
import {ClipLoader} from "react-spinners";
import ReactTooltip from "react-tooltip";

type DashboardProps = {
  onMouseDown: () => void
}

export function Dashboard({onMouseDown}: DashboardProps) {
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();

  const isOnline = useIsOnline();
  const activeUsers = useActiveUsers();

  const changedPixels = useBoardState()?.changed ?? [];

  const wallet = useWallet();

  return (
    <Draggable onMouseDown={onMouseDown}>
      <div className="dashboard">
        <div className="dashboard-row">
          <div className="dashboard-item">
            {!wallet.connected && <WalletMultiButton className="action-button"/>}
            {wallet.connected
              && <button
                className="action-button"
                disabled={changedPixels.length === 0}
                onClick={() => {
                  changePixels(serverUrl, changedPixels, wallet)
                    .catch(console.error);
                }}>Send{changedPixels.length > 0 ? ` (${changedPixels.length})` : ""}</button>}
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
          <div className="dashboard-item online-circle-holder">
            <div
              data-tip={true}
              data-for="online-circle-tooltip-id"
              className={`online-circle ${!isOnline ? "online-circle-offline" : ""}`}>
              {!isOnline && <ClipLoader cssOverride={{width: "22px", height: "22px"}} speedMultiplier={0.5}/>}
            </div>
            <span className="online-circle-label">{isOnline ? "Online" : "Connecting..."}</span>
            <ReactTooltip
              class="online-circle-tooltip"
              id="online-circle-tooltip-id"
              type={isOnline ? "success" : "info"}
              effect="solid"
            >
              {isOnline
                ? <>Connected<br/>Users online: {activeUsers}</>
                : <>You are connecting to the server...</>
              }
            </ReactTooltip>
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

function BoardHistoryExplorerLink({signature}: { signature: string }) {
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
      {boardHistory.events.map(({event, transactionDetails}) => (
        <tr
          key={transactionDetails.signature + event.row + event.column}
          className="board-history-row"
          onMouseOut={() => highlightPixel(undefined)}
          onMouseOver={() => highlightPixel({
            pixelCoordinates: {
              row: event.row,
              column: event.column
            }
          })}
        >
          <td><BoardHistoryChangeArrow oldColor={event.oldColor} newColor={event.newColor}/></td>
          <td>{formatTime(transactionDetails.timestamp)}</td>
          <td>{transactionDetails.signature.slice(0, 7)}…</td>
          <td>{transactionDetails.sender.slice(0, 7)}…</td>
          <td><BoardHistoryExplorerLink signature={transactionDetails.signature}/></td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>;
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * 60 * 60;

const timeRanges: [number, string][] = [
  [10, "10 sec"],
  [SECONDS_PER_MINUTE, "1 min"],
  [5 * SECONDS_PER_MINUTE, "5 min"],
  [10 * SECONDS_PER_MINUTE, "10 min"],
  [30 * SECONDS_PER_MINUTE, "30 min"],
  [SECONDS_PER_HOUR, "1 hour"],
  [3 * SECONDS_PER_HOUR, "3 hour"],
  [6 * SECONDS_PER_HOUR, "6 hour"],
  [SECONDS_PER_DAY, "1 day"],
  [3 * SECONDS_PER_DAY, "3 day"]
]

function formatTime(timestamp: number): string {
  const date = new Date();
  const elapsedSeconds = Math.abs(Math.floor(date.getTime() / 1000) - timestamp);
  for (const [time, timeString] of timeRanges) {
    if (elapsedSeconds < time) {
      return "< " + timeString + " ago";
    }
  }
  return displayTimestamp(timestamp * 1000);
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
  switch (cluster) {
    case "mainnet-beta":
      return "";
    case "devnet":
      return "cluster=devnet"
    case "testnet":
      return "cluster=testnet"
    case "custom":
      return "cluster=custom&customUrl=http://localhost:8899"
  }
}