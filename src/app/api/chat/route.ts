import { openai } from '@ai-sdk/openai';
import { Message, createDataStreamResponse, streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    // Get the message and conversation ID
    const body = await req.json();
    console.log('[chat/route] Received request:', JSON.stringify(body, null, 2));
    
    const { id: conversationId, message }: { id: string; message: Message } = body;

    if (!message) {
      console.error('[chat/route] No message found in request');
      return new Response('No message found', { status: 400 });
    }

    console.log('[chat/route] Processing message:', message.content);

    // Build the system prompt
    const systemPrompt = `You are CordAi, a helpful AI assistant specialized in Solana blockchain. 
You help users with:
- Checking wallet balances and token information
- Getting token prices and market data
- Searching for tokens
- Understanding Solana transactions
- General Solana blockchain questions

Conversation ID: ${conversationId}

Be concise, helpful, and friendly.`;

    // For now, just use the current message
    // TODO: Load conversation history from database
    const messages = [message];

    // Begin the stream response using createDataStreamResponse
    console.log('[chat/route] Starting stream...');
    
    return createDataStreamResponse({
      execute: async (dataStream) => {
        console.log('[chat/route] Executing stream...');
        
        const result = streamText({
          model: openai('gpt-3.5-turbo'),
          system: systemPrompt,
          messages: messages,
          onFinish: () => {
            console.log('[chat/route] Stream finished');
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        console.error('[chat/route] Stream error:', error);
        return 'An error occurred';
      },
    });
  } catch (error) {
    console.error('[chat/route] Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
