'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use mainnet
  const network = WalletAdapterNetwork.Mainnet;

  // Use Helius RPC or fallback to public RPC
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_HELIUS_RPC_URL || clusterApiUrl(network),
    [network]
  );

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
