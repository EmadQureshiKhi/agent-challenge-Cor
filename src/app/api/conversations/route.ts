import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for conversations (will be replaced with database)
const conversationsStore = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  // Get conversations for this user from memory
  const userConversations = conversationsStore.get(userId) || [];
  return NextResponse.json(userConversations);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, conversation } = await request.json();

    if (!userId || !conversation) {
      return NextResponse.json(
        { error: 'User ID and conversation required' },
        { status: 400 }
      );
    }

    // Get existing conversations
    const userConversations = conversationsStore.get(userId) || [];

    // Check if conversation already exists
    const existingIndex = userConversations.findIndex(
      (c) => c.id === conversation.id
    );

    if (existingIndex >= 0) {
      // Update existing conversation
      userConversations[existingIndex] = {
        ...userConversations[existingIndex],
        ...conversation,
        lastMessageAt: new Date().toISOString(),
      };
    } else {
      // Add new conversation
      userConversations.unshift({
        ...conversation,
        lastMessageAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      });
    }

    // Save back to store
    conversationsStore.set(userId, userConversations);

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, conversationId } = await request.json();

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: 'User ID and conversation ID required' },
        { status: 400 }
      );
    }

    // Get existing conversations
    const userConversations = conversationsStore.get(userId) || [];

    // Filter out the conversation to delete
    const updatedConversations = userConversations.filter(
      (c) => c.id !== conversationId
    );

    // Save back to store
    conversationsStore.set(userId, updatedConversations);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
