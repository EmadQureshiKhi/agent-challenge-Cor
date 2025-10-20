import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const getWalletBalanceTool = createTool({
  id: 'get-wallet-balance',
  description: 'Get the SOL balance of a Solana wallet address',
  inputSchema: z.object({
    address: z.string().describe('Solana wallet address'),
  }),
  outputSchema: z.object({
    address: z.string().describe('Wallet address'),
    balance: z.number().describe('SOL balance'),
    lamports: z.number().describe('Balance in lamports'),
  }),
  execute: async ({ context }) => {
    try {
      // Use public RPC endpoint
      const connection = new Connection(
        process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );

      const publicKey = new PublicKey(context.address);
      const lamports = await connection.getBalance(publicKey);
      const balance = lamports / LAMPORTS_PER_SOL;

      return {
        address: context.address,
        balance,
        lamports,
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error('Invalid wallet address or failed to fetch balance');
    }
  },
});
