'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Attachment, JSONValue } from 'ai';
import { useChat } from 'ai/react';
import { v4 as uuidv4 } from 'uuid';
import BlurFade from '@/components/ui/blur-fade';
import TypingAnimation from '@/components/ui/typing-animation';
import { SimpleInput } from './simple-input';
import { SimpleSuggestion } from './simple-suggestion';
import { IntegrationsGrid } from '@/app/home/components/integrations-grid';
import { ChatInterface } from './chat-interface';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/use-conversations';
import { useWalletUser } from '@/hooks/use-wallet-user';
import { EVENTS } from '@/lib/events';

const suggestions = [
  {
    title: 'Check Wallet Balance',
    description: 'Get SOL and token balances for any wallet',
    prompt: 'What is the balance of wallet address...',
  },
  {
    title: 'Token Price',
    description: 'Get current prices for any Solana token',
    prompt: 'What is the current price of SOL?',
  },
  {
    title: 'Search Token',
    description: 'Find tokens by name, symbol, or address',
    prompt: 'Search for BONK token',
  },
  {
    title: 'Trending Tokens',
    description: "Discover what's hot on Solana right now",
    prompt: 'Show me trending tokens on Solana',
  },
];

interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="mb-2 px-1 text-sm font-medium text-muted-foreground/80">
      {children}
    </h2>
  );
}

export default function ChatPage() {
  const { publicKey } = useWallet();
  const { userId } = useWalletUser();
  const pathname = usePathname();
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(() => uuidv4());
  const { conversations, refreshConversations } = useConversations(userId || undefined);

  const resetChat = useCallback(() => {
    setShowChat(false);
    setChatId(uuidv4());
  }, []);

  const { messages, input, handleSubmit, setInput, error } = useChat({
    api: '/api/chat',
    id: chatId,
    initialMessages: [],
    body: { id: chatId },
    onFinish: () => {
      // Only refresh if we have a new conversation that's not in the list
      if (chatId && !conversations?.find((conv) => conv.id === chatId)) {
        refreshConversations().then(() => {
          // Dispatch event to mark conversation as read
          window.dispatchEvent(new CustomEvent(EVENTS.CONVERSATION_READ));
        });
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    experimental_prepareRequestBody: ({ messages }) => {
      return {
        message: messages[messages.length - 1],
        id: chatId,
      } as unknown as JSONValue;
    },
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Chat error:', error);
    }
  }, [error]);

  // Reset chat when pathname changes to /chat
  useEffect(() => {
    if (pathname === '/chat') {
      resetChat();
    }
  }, [pathname, resetChat]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/chat') {
        resetChat();
      } else if (location.pathname === `/chat/${chatId}`) {
        setShowChat(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [chatId, resetChat]);

  // Show wallet connection prompt if not connected
  if (!publicKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <BlurFade delay={0.1}>
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold">Connect Your Wallet</h1>
            <p className="mb-8 text-muted-foreground">
              Please connect your Solana wallet to use CordAi
            </p>
            <WalletMultiButton className="!h-12 !px-6 !text-base" />
          </div>
        </BlurFade>
      </div>
    );
  }

  const handleSend = async (value: string, attachments?: Attachment[]) => {
    if (!value.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    // Create a synthetic event for handleSubmit
    const fakeEvent = {
      preventDefault: () => {},
      type: 'submit',
    } as React.FormEvent;

    // Submit the message
    await handleSubmit(fakeEvent, {
      data: value,
      experimental_attachments: attachments || [],
    });

    // Save conversation to API
    if (userId) {
      try {
        await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            conversation: {
              id: chatId,
              title: value.substring(0, 50) || 'New Chat',
              userId,
            },
          }),
        });
        // Refresh conversations list
        refreshConversations();
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }

    // Update UI state and URL
    setShowChat(true);
    window.history.replaceState(null, '', `/chat/${chatId}`);
  };

  const mainContent = (
    <div
      className={cn(
        'mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6',
        'py-12',
      )}
    >
      <BlurFade delay={0.2}>
        <TypingAnimation
          className="mb-12 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-center text-4xl font-semibold tracking-tight text-transparent md:text-4xl lg:text-5xl"
          duration={50}
          text="How can I assist you?"
        />
      </BlurFade>

      <div className="mx-auto w-full max-w-3xl space-y-8">
        <BlurFade delay={0.1}>
          <SimpleInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            placeholder="Ask me anything about Solana..."
          />
        </BlurFade>

        <div className="space-y-8">
          <BlurFade delay={0.2}>
            <div className="space-y-2">
              <SectionTitle>Suggestions</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                  <SimpleSuggestion
                    key={suggestion.title}
                    {...suggestion}
                    onClick={() => setInput(suggestion.prompt)}
                  />
                ))}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="space-y-2">
              <SectionTitle>Integrations</SectionTitle>
              <IntegrationsGrid />
            </div>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Powered by AI • Built for Solana • Open Source
              </p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <a
                  href="https://x.com/thecorgod1234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Follow us on X
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://github.com/EmadQureshiKhi/agent-challenge-Cor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  GitHub
                </a>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-screen">
      {!showChat && (
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-300',
            showChat ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          {mainContent}
        </div>
      )}
      {showChat && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            showChat ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ChatInterface id={chatId} initialMessages={messages} />
        </div>
      )}
    </div>
  );
}
