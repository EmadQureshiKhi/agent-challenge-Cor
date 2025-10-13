// Temporary Prisma types for hackathon
// These replace the actual Prisma client types

export interface SavedPrompt {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  privyId: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface Action {
  id: string;
  userId: string;
  name: string;
  description?: string;
  prompt: string;
  schedule?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
