import { Suspense } from 'react';
import { Metadata } from 'next';
import ChatInterface from './chat-interface';
import { ChatSkeleton } from './chat-skeleton';

/**
 * Generates metadata for the chat page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chat - CordAi`,
    description: `Chat conversation with CordAi`,
  };
}

/**
 * Component responsible for rendering chat
 */
async function ChatData({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Render the chat interface - it will handle loading messages
  return <ChatInterface id={id} initialMessages={[]} />;
}

/**
 * Main chat page component with loading state handling
 */
export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatData params={params} />
    </Suspense>
  );
}
