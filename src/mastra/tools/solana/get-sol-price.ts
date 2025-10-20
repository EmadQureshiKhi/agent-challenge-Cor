import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const getSolPriceTool = createTool({
  id: 'get-sol-price',
  description: 'Get the current price of SOL (Solana) in USD',
  inputSchema: z.object({}),
  outputSchema: z.object({
    price: z.number().describe('Current SOL price in USD'),
    change24h: z.number().describe('24h price change percentage'),
    volume24h: z.number().describe('24h trading volume in USD'),
    marketCap: z.number().describe('Market capitalization in USD'),
  }),
  execute: async () => {
    try {
      // Using CoinGecko API (free, no API key needed)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch SOL price: ${response.statusText}`);
      }

      const data = await response.json();
      const solData = data.solana;

      return {
        price: solData.usd,
        change24h: solData.usd_24h_change || 0,
        volume24h: solData.usd_24h_vol || 0,
        marketCap: solData.usd_market_cap || 0,
      };
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      throw new Error('Failed to fetch SOL price. Please try again.');
    }
  },
});
