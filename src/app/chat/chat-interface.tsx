'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Attachment, JSONValue, Message } from 'ai';
import { useChat } from 'ai/react';
import { Loader2, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SimpleInput } from './simple-input';
import { EVENTS } from '@/lib/events';
import usePolling from '@/hooks/use-polling';

interface ChatInterfaceProps {
  id: string;
  initialMessages?: Message[];
}

function LoadingMessage() {
  return (
    <div className="flex w-full items-start gap-3">
      <Avatar className="mt-0.5 h-8 w-8 shrink-0 select-none">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>

      <div className="relative flex max-w-[85%] flex-col items-start gap-2">
        <div className="relative flex flex-col gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface({ id, initialMessages = [] }: ChatInterfaceProps) {
  const {
    messages: chatMessages,
    input,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
    error,
  } = useChat({
    api: '/api/chat',
    id,
    initialMessages,
    sendExtraMessageFields: true,
    body: { id },
    onFinish: () => {
      if (window.location.pathname === `/chat/${id}`) {
        window.history.replaceState({}, '', `/chat/${id}`);
      }
      // Dispatch event to mark conversation as read
      window.dispatchEvent(new CustomEvent(EVENTS.CONVERSATION_READ));
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    experimental_prepareRequestBody: ({ messages }) => {
      return {
        message: messages[messages.length - 1],
        id,
      } as unknown as JSONValue;
    },
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Chat error:', error);
    }
  }, [error]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Use polling for fetching new messages
  usePolling({
    url: `/api/chat/${id}`,
    onUpdate: (data: Message[]) => {
      if (!data) {
        return;
      }

      if (data && data.length) {
        setMessages(data);
      }

      window.dispatchEvent(new CustomEvent(EVENTS.CONVERSATION_READ));
    },
  });

  const handleSend = async (value: string, attachments?: Attachment[]) => {
    if (!value.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    // Create a synthetic event for handleSubmit
    const fakeEvent = {
      preventDefault: () => {},
      type: 'submit',
    } as React.FormEvent;

    // Prepare message data with attachments if present
    const currentAttachments = attachments
      ? attachments.map(({ url, name, contentType }) => ({
          url,
          name,
          contentType,
        }))
      : [];

    // Submit the message
    await handleSubmit(fakeEvent, {
      data: value,
      experimental_attachments: currentAttachments,
    });
    scrollToBottom();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar relative flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl">
          <div className="space-y-4 px-4 pb-36 pt-4">
            {chatMessages.map((message, index) => {
              const isUser = message.role === 'user';
              const showAvatar =
                !isUser &&
                (index === 0 || chatMessages[index - 1].role === 'user');
              const isConsecutive =
                index > 0 && chatMessages[index - 1].role === message.role;

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full items-start gap-3',
                    isUser ? 'flex-row-reverse' : 'flex-row',
                    isConsecutive ? 'mt-2' : 'mt-6',
                    index === 0 && 'mt-0',
                  )}
                >
                  {showAvatar ? (
                    <Avatar className="mt-0.5 h-8 w-8 shrink-0 select-none">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : !isUser ? (
                    <div className="w-8" aria-hidden="true" />
                  ) : null}

                  <div className="group relative flex max-w-[85%] flex-row items-center">
                    <div
                      className={cn(
                        'relative gap-2',
                        isUser ? 'items-end' : 'items-start',
                      )}
                    >
                      {message.content && (
                        <div
                          className={cn(
                            'relative flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm',
                            isUser ? 'bg-primary' : 'bg-muted/60',
                          )}
                        >
                          <div
                            className={cn(
                              'prose prose-sm max-w-prose break-words leading-tight md:prose-base',
                              isUser
                                ? 'prose-invert dark:prose-neutral'
                                : 'prose-neutral dark:prose-invert',
                            )}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading &&
              chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
                <LoadingMessage />
              )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/95 to-background/0" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-4">
          <SimpleInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
