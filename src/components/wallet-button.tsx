'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function WalletButton() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [justConnected, setJustConnected] = useState(false);

  // Navigate to chat when wallet connects (but only once per connection)
  useEffect(() => {
    if (publicKey && justConnected) {
      router.push('/chat');
      setJustConnected(false);
    }
  }, [publicKey, justConnected, router]);

  const handleClick = () => {
    if (publicKey) {
      // If connected, disconnect
      disconnect();
    } else {
      // If not connected, show wallet modal and mark as just connected
      setJustConnected(true);
      setVisible(true);
    }
  };

  return (
    <Button
      variant="outline"
      className="h-9 rounded-lg px-4 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
      onClick={handleClick}
    >
      {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Login'}
    </Button>
  );
}
