import * as React from "react";
import {useBoardConfig, useSetBoardConfig} from "../providers/board/boardConfig";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import Draggable from "react-draggable"
import {changePixels} from "request/changePixels";
import {useActiveUsers, useIsOnline} from "../providers/server/webSocket";
import {useBoardHistory} from "../providers/board/boardHistory";
import {useHighlightPixel} from "../providers/board/highlightedPixel";
import {getColorByIndex} from "../utils/colorUtils";
import {displayTimestamp} from "../utils/date";
import {ClipLoader} from "react-spinners";
import ReactTooltip from "react-tooltip";
import {useSetAbout} from "../providers/about/about";
import {
  ClockIcon as HistoryIconNotChecked,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  Squares2X2Icon,
  WalletIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import {usePendingTransaction, useSetAndUnsetPendingTransaction} from "../providers/transactions/pendingTransaction";
import {useAddNotification} from "../providers/notifications/notifications";
import {
  buildErrorNotification,
  buildInfoNotification
} from "../model/notification";
import {SHORTENED_SYMBOL, shortenPublicKey, shortenTransactionSignature} from "../utils/presentationUtils";
import {ExplorerTransactionLink} from "./ExplorerTransactionLink";
import {useZooming} from "../providers/zooming/zooming";
import {useIsPhone} from "../utils/mobile";

export function Dashboard() {
  const {showHistory} = useBoardConfig();
  const {zoom} = useZooming()[0];
  const isPhone = useIsPhone();

  return (
    <Draggable cancel=".dashboard-cancel-draggable">
      <div className="dashboard">
        <div className="dashboard-row">
          <ConnectionButton/>
          <SendChangesButton/>
          <ShowGridToggle/>
          {!isPhone && <ShowHistoryToggle/>}
          <ShowZoom zoom={zoom}/>
          <OnlineStatus/>
          <ShowAbout/>
        </div>
        {showHistory && <div className="dashboard-row">
          <div className="dashboard-item">
            <BoardHistoryTable/>
          </div>
        </div>}
      </div>
    </Draggable>
  );
}

function ConnectionButton() {
  const isPhone = useIsPhone();
  const isConnected = useWallet().connected;
  let content = undefined;
  if (isPhone) {
    if (isConnected) {
      content = <div/>;
    } else {
      content = <WalletIcon className="action-button-icon"/>;
    }
  }
  return <div className="dashboard-item">
    <div className="dashboard-cancel-draggable">
      <WalletMultiButton className={`action-button ${isPhone ? 'action-button-phone' : ''}`}>
        {content}
      </WalletMultiButton>
    </div>
  </div>;
}

function SendChangesButton() {
  const wallet = useWallet();
  const setBoardConfig = useSetBoardConfig();
  const {changedPixels, pendingTransaction} = usePendingTransaction();
  const addNotification = useAddNotification();
  const isPendingTransaction = pendingTransaction !== null;
  const isWalletConnected = wallet.connected;
  const isAnyChanged = changedPixels.length > 0;
  const isDisabled = !isWalletConnected || !isAnyChanged || isPendingTransaction;
  const {setPendingTransaction} = useSetAndUnsetPendingTransaction();
  const onClick = React.useCallback(() => {
    if (isDisabled) return;
    changePixels(changedPixels, wallet)
      .then(transactionSignature => {
        setPendingTransaction(transactionSignature);
        addNotification(
          buildInfoNotification(
            "Transaction has been sent",
            {
              type: "waitingForTransaction",
              transactionSignature
            }
          )
        )
      })
      .catch((e) => addNotification(buildErrorNotification("Failed to change pixels", e)));
  }, [isDisabled, changedPixels, wallet, setPendingTransaction, addNotification]);
  const onMouseEnter = React.useCallback(() => {
    setBoardConfig(config => ({...config, isHighlightChangedPixels: true}));
  }, [setBoardConfig]);
  const onMouseLeave = React.useCallback(() => {
    setBoardConfig(config => ({...config, isHighlightChangedPixels: false}));
  }, [setBoardConfig]);

  const tooltipText = React.useMemo(() => {
    if (isPendingTransaction) {
      if (changedPixels.length > 0) {
        return `Sending ${changedPixels.length}${SHORTENED_SYMBOL}`;
      }
      return "Sending" + SHORTENED_SYMBOL
    }
    if (!isWalletConnected) {
      return "Connect the wallet";
    }
    if (!isAnyChanged) {
      return "Change some pixels";
    }
    return `Send (${changedPixels.length})`;
  }, [isPendingTransaction, isWalletConnected, isAnyChanged, changedPixels]);

  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder`}
        data-tip={true}
        data-for="wallet-tooltip-id"
      >
        {isPendingTransaction
          ? <ClipLoader className="send-changes-pending-loader"/>
          : <PaperAirplaneIcon
            className={`send-changes-icon send-changes-icon-${isDisabled ? "disabled" : "enabled"}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        }
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="wallet-tooltip-id"
        type="info"
        effect="solid"
      >
        {tooltipText}
      </ReactTooltip>
    </div>
  );
}

function ShowGridToggle() {
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();
  const isChecked = boardConfig.showGrid;
  const onClick = React.useCallback(() => {
    setBoardConfig((prevConfig) => ({
      ...prevConfig,
      showGrid: !isChecked
    }))
  }, [isChecked, setBoardConfig]);
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder ${isChecked ? "checked-toggle" : ""}`}
        data-tip={true}
        data-for="grid-tooltip-id"
      >
        <Squares2X2Icon
          className="grid-icon"
          onClick={onClick}
        />
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="grid-tooltip-id"
        type="info"
        effect="solid"
      >Show grid
      </ReactTooltip>
    </div>

  );
}

type ShowZoomProps = { zoom: number };

function ShowZoom({zoom}: ShowZoomProps) {
  const isPhone = useIsPhone();
  const zoomString = zoom * 100;
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder`}
        data-tip={true}
        data-for="zoom-tooltip-id"
      >
        <MagnifyingGlassIcon className="show-zoom-icon"/>
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="zoom-tooltip-id"
        type="info"
        effect="solid"
      >Use mouse wheel or +/- keys to zoom in/out
      </ReactTooltip>
      {!isPhone && zoomString + '%'}
    </div>
  );
}


function ShowHistoryToggle() {
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();
  const isChecked = boardConfig.showHistory;
  const onClick = React.useCallback(() => {
    setBoardConfig((prevConfig) => ({
      ...prevConfig,
      showHistory: !isChecked
    }))
  }, [isChecked, setBoardConfig]);
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder ${isChecked ? "checked-toggle" : ""}`}
        data-tip={true}
        data-for="history-tooltip-id"
      >
        <HistoryIconNotChecked
          className="history-icon"
          onClick={onClick}
        />
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="history-tooltip-id"
        type="info"
        effect="solid"
      >Show history of changes
      </ReactTooltip>
    </div>
  );
}

function OnlineStatus() {
  const isOnline = useIsOnline();
  const activeUsers = useActiveUsers();

  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder`}
        data-tip={true}
        data-for="online-status-tooltip-id"
      >
        {isOnline
          ? <WifiIcon className="online-status-icon"/>
          : <ClipLoader size="1.5rem" speedMultiplier={0.5}/>
        }
      </div>
      <ReactTooltip
        class={`dashboard-tooltip online-status-tooltip online-status-tooltip-${isOnline ? "success" : "connecting"}`}
        id="online-status-tooltip-id"
        type={isOnline ? "success" : "info"}
        effect="solid"
      >
        {isOnline
          ? <>Connected<br/>Users online: {activeUsers}</>
          : <>You are connecting to the server...</>
        }
      </ReactTooltip>
    </div>
  );
}

function ShowAbout() {
  const setAbout = useSetAbout();
  return <div className="dashboard-item">
    <InformationCircleIcon
      className={`dashboard-cancel-draggable show-zoom-icon`}
      onClick={() => setAbout(prevState => ({...prevState, showAboutModal: true}))}
    />
  </div>;
}

function BoardHistoryTable() {
  const boardHistory = useBoardHistory();
  const highlightPixel = useHighlightPixel();

  const boardRows = React.useMemo(() => {
    if (!boardHistory) {
      return [];
    }
    return boardHistory.events.flatMap(({event, transactionDetails}) => {
      if (event.type !== "pixelsChangedEvent") {
        return [];
      }
      return event.changes.map(change => ({...change, transactionDetails}));
    });
  }, [boardHistory]);

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
      {boardRows.map(({row, column, oldColor, newColor, transactionDetails}) => (
        <tr
          key={transactionDetails.signature + row + column}
          className="board-history-row"
          onMouseOut={() => highlightPixel(undefined)}
          onMouseOver={() => highlightPixel({
            pixelCoordinates: {row, column}
          })}
        >
          <td><BoardHistoryChangeArrow oldColor={oldColor} newColor={newColor}/></td>
          <td>{formatTime(transactionDetails.timestamp)}</td>
          <td>{shortenTransactionSignature(transactionDetails.signature)}{SHORTENED_SYMBOL}</td>
          <td>{shortenPublicKey(transactionDetails.sender)}{SHORTENED_SYMBOL}</td>
          <td>
            <div className="board-history-cell">
              <ExplorerTransactionLink signature={transactionDetails.signature}/>
            </div>
          </td>
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
  [2 * SECONDS_PER_HOUR, "2 hours"],
  [3 * SECONDS_PER_HOUR, "3 hours"],
  [6 * SECONDS_PER_HOUR, "6 hours"],
  [12 * SECONDS_PER_HOUR, "12 hours"],
  [SECONDS_PER_DAY, "1 day"],
  [2 * SECONDS_PER_DAY, "2 days"],
  [3 * SECONDS_PER_DAY, "3 days"]
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