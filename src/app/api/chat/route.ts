import { Message, createDataStreamResponse } from 'ai';
import { mastra } from '@/mastra';

export const runtime = 'nodejs'; // Changed from 'edge' to support Mastra
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    // Get the message and conversation ID
    const body = await req.json();
    console.log('[chat/route] Received request:', JSON.stringify(body, null, 2));
    
    const { id: conversationId, message, userId }: { id: string; message: Message; userId?: string } = body;

    if (!message) {
      console.error('[chat/route] No message found in request');
      return new Response('No message found', { status: 400 });
    }

    if (!userId) {
      console.error('[chat/route] No userId found in request');
      return new Response('User ID required', { status: 400 });
    }

    console.log('[chat/route] Processing message:', message.content);

    // Get the CordAi agent from Mastra
    const agent = mastra.getAgent('cordaiAgent');

    if (!agent) {
      console.error('[chat/route] CordAi agent not found');
      return new Response('Agent not configured', { status: 500 });
    }

    // Generate response using Mastra agent
    console.log('[chat/route] Calling Mastra agent...');
    
    return createDataStreamResponse({
      execute: async (dataStream) => {
        console.log('[chat/route] Executing stream with Mastra...');
        
        try {
          // Use stream() method for AI SDK v4 models
          // Enhance the message with wallet context when user refers to "my wallet" or "my balance"
          let enhancedMessage = message.content;
          const myWalletPattern = /\b(my|mine)\s+(wallet|balance|address|sol)\b/i;
          
          if (myWalletPattern.test(message.content)) {
            enhancedMessage = `${message.content}\n\n[Context: User's connected wallet address is ${userId}]`;
          }
          
          console.log('[chat/route] Enhanced message:', enhancedMessage);
          
          const result = await agent.stream(enhancedMessage, {
            threadId: conversationId,
            resourceId: userId,
          });

          console.log('[chat/route] Agent stream started');

          // The stream result from Mastra already contains the streaming data
          // We need to pipe it to the dataStream
          result.mergeIntoDataStream(dataStream);
          
          console.log('[chat/route] Stream merged');
        } catch (agentError) {
          console.error('[chat/route] Agent error:', agentError);
          throw agentError;
        }
      },
      onError: (error) => {
        console.error('[chat/route] Stream error:', error);
        return 'An error occurred while processing your request. Please try again.';
      },
    });
  } catch (error) {
    console.error('[chat/route] Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
