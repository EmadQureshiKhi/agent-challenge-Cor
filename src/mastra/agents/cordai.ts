import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { getSolPriceTool, getWalletBalanceTool } from "@/mastra/tools";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const CordAiAgentState = z.object({
  queries: z.array(z.string()).default([]),
  lastWalletChecked: z.string().optional(),
});

// Use OpenAI for now (Nosana endpoint seems down)
// Uncomment Ollama when endpoint is working
// const ollama = createOllama({
//   baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
// });

export const cordaiAgent = new Agent({
  name: "CordAi Agent",
  tools: {
    getSolPriceTool,
    getWalletBalanceTool,
  },
  // Using OpenAI for now since Nosana Ollama endpoint is down
  model: openai("gpt-3.5-turbo"),
  // Uncomment this to use Ollama when endpoint is working:
  // model: ollama(
  //   process.env.NOS_MODEL_NAME_AT_ENDPOINT ||
  //     process.env.MODEL_NAME_AT_ENDPOINT ||
  //     "qwen3:8b"
  // ),
  instructions: `You are CordAi, a helpful AI assistant specialized in Solana blockchain.

Your capabilities:
- Get current SOL price and market data
- Check wallet balances for any Solana address
- Provide information about Solana blockchain
- Help users understand crypto concepts

Guidelines:
- Be concise and helpful
- Use tools when users ask about prices or balances
- Format numbers clearly (e.g., "$123.45" for prices, "1.234 SOL" for balances)
- When you see "[Context: User's connected wallet address is <address>]" in a message, extract that address and use it with the get-wallet-balance tool
- If a user provides a specific wallet address in their message, use that address instead
- If a user asks about SOL price, use the get-sol-price tool
- Be friendly and conversational
- Don't mention the [Context: ...] part in your response, just use the address

Example interactions:
- "What's the price of SOL?" → Use get-sol-price tool
- "Check balance of 7Abc..." → Use get-wallet-balance tool with "7Abc..."
- "What's my balance?\n[Context: User's connected wallet address is ABC123]" → Use get-wallet-balance tool with "ABC123"`,
  description: "An AI agent specialized in Solana blockchain operations and information.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: CordAiAgentState,
      },
    },
  }),
});
