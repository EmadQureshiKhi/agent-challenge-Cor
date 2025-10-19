'use client';

import Link from 'next/link';

import { RiTwitterXFill } from '@remixicon/react';
import { BookOpen, ChevronsUpDown, HelpCircle, Settings, Copy } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppSidebarUser = () => {
  const { publicKey, disconnect, wallet } = useWallet();
  const isMobile = useIsMobile();

  const walletAddress = publicKey?.toBase58();
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : '';
  const walletName = wallet?.adapter?.name || 'Wallet';

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  {shortAddress.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{walletName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {shortAddress}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              {/* Copy Address */}
              <DropdownMenuItem onClick={handleCopyAddress}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Address
              </DropdownMenuItem>

              {/* Follow us on X */}
              <DropdownMenuItem
                onClick={() => window.open('https://x.com/thecorgod1234', '_blank')}
              >
                <RiTwitterXFill className="mr-2 h-4 w-4" />
                Follow us on X
              </DropdownMenuItem>

              {/* GitHub */}
              <DropdownMenuItem
                onClick={() => window.open('https://github.com/EmadQureshiKhi/agent-challenge-Cor', '_blank')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                GitHub
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
