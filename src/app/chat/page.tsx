'use client';

import { useState, useMemo } from 'react';
import BlurFade from '@/components/ui/blur-fade';
import { Card } from '@/components/ui/card';
import TypingAnimation from '@/components/ui/typing-animation';
import { SimpleInput } from './simple-input';
import { SimpleSuggestion } from './simple-suggestion';
import { IntegrationsGrid } from '@/app/home/components/integrations-grid';
import { cn } from '@/lib/utils';

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
    description: 'Discover what\'s hot on Solana right now',
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
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    setInitialMessage(prompt);
    setShowChat(true);
  };

  const handleSubmit = (message: string) => {
    setInitialMessage(message);
    setShowChat(true);
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
            onSubmit={handleSubmit}
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
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
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
        </div>
      </div>
    </div>
  );

  if (showChat) {
    return (
      <div className="flex h-screen w-full flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <Card className="p-6">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-semibold">Chat Interface</h3>
                <p className="text-sm text-muted-foreground">
                  Your message: <span className="font-medium">{initialMessage}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Mastra agent integration coming next!
                </p>
              </div>
              <SimpleInput
                onSubmit={(msg) => console.log('New message:', msg)}
                placeholder="Continue the conversation..."
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return mainContent;
}
