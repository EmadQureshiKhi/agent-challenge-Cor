import { MCPServer } from "@mastra/mcp"
import { getSolPriceTool, getWalletBalanceTool, weatherTool } from "../tools";
import { cordaiAgent, weatherAgent } from "../agents";

export const server = new MCPServer({
  name: "CordAi MCP Server",
  version: "1.0.0",
  tools: {
    getSolPriceTool,
    getWalletBalanceTool,
    weatherTool,  // Keep for reference
  },
  agents: {
    cordaiAgent,  // Main agent - becomes tool "ask_cordaiAgent"
    weatherAgent, // Reference agent
  },
  // workflows: {
  // dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  // }
});
