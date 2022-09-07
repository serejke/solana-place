import React, {useMemo} from 'react';
import {useWallet, WalletProvider as SolanaWalletProvider} from '@solana/wallet-adapter-react';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import {useAddNotification} from "./notifications/notifications";
import {buildErrorNotification, buildInfoNotification, buildSuccessNotification} from "../model/notification";
import {SHORTENED_SYMBOL} from "../utils/presentationUtils";

export function WalletProvider({children}: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter()
    ],
    []
  );

  const addNotification = useAddNotification();

  return (
    <SolanaWalletProvider
      wallets={wallets}
      onError={e => addNotification(buildErrorNotification("Wallet was not connected", e))}
      autoConnect
    >
      <WalletModalProviderWithListener children={children}/>
    </SolanaWalletProvider>
  );
}

function WalletModalProviderWithListener({children}: { children: React.ReactNode }) {
  const wallet = useWallet();
  const addNotification = useAddNotification();

  React.useEffect(() => {
    if (wallet.connecting) {
      addNotification(buildInfoNotification(
        "Connecting wallet",
        {
          type: "string",
          content: `Wait for the wallet to be connected${SHORTENED_SYMBOL}`
        }
      ))
    }
  }, [wallet.connecting, addNotification])

  React.useEffect(() => {
    if (wallet.connected) {
      addNotification(buildSuccessNotification(
        "Wallet connected",
        {
          type: "string",
          content: "Now you can change pixels and send a transaction",
        }
      ))
    }
  }, [wallet.connected, addNotification]);
  return <WalletModalProvider>{children}</WalletModalProvider>;
}