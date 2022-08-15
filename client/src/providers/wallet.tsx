import React, {useMemo} from 'react';
import {WalletProvider as SolanaWalletProvider} from '@solana/wallet-adapter-react';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui';

type Props = { children: React.ReactNode };

export function WalletProvider({children}: Props) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter()
    ],
    []
  );

  return (
    <SolanaWalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </SolanaWalletProvider>
  );
}