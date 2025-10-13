'use client';

import { CopilotChat } from "@copilotkit/react-ui";
import { Brand } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <Brand />
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <CopilotChat
          className="h-full"
          labels={{
            title: "CordAi - Solana AI Agent",
            initial: "Hi! I'm CordAi, your intelligent Solana assistant. How can I help you today?",
          }}
        />
      </div>
    </div>
  );
}
