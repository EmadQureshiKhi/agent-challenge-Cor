'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

/**
 * Hook to get wallet-based user ID
 * Uses the wallet's public key as the user identifier
 */
export function useWalletUser() {
  const { publicKey, connected } = useWallet();

  const userId = useMemo(() => {
    return publicKey?.toBase58() || null;
  }, [publicKey]);

  return {
    userId,
    isConnected: connected,
    publicKey,
  };
}
