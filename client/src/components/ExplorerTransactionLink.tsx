import SolanaExplorerLogo from "../styles/icons/dark-solana-logo.svg";
import * as React from "react";
import { useServerConfig } from "../providers/server/serverConfig";

export function ExplorerTransactionLink({
  signature,
  className,
}: {
  signature: string;
  className?: string;
}) {
  const clusterParam = useClusterParam();
  const explorerLink = (path: string) =>
    `https://explorer.solana.com/${path}?${clusterParam}`;
  return (
    <a
      href={explorerLink("tx/" + signature)}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Explorer"
      className={className}
    >
      <img
        className="board-history-explorer-link"
        src={SolanaExplorerLogo}
        alt="Solana Explorer"
      />
    </a>
  );
}

function useClusterParam(): string | undefined {
  const clusterConfig = useServerConfig();
  if (!clusterConfig) {
    return undefined;
  }
  const cluster = clusterConfig.chains.solana.cluster;
  switch (cluster) {
    case "mainnet-beta":
      return "";
    case "devnet":
      return "cluster=devnet";
    case "testnet":
      return "cluster=testnet";
    case "custom":
      return "cluster=custom&customUrl=http://localhost:8899";
  }
}
