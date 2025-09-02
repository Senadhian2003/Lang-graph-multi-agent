import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import {McpServers} from './mcp-server.js';

export const client = new MultiServerMCPClient({
  // Global tool configuration options
  // Whether to throw on errors if a tool fails to load (optional, default: true)
  throwOnLoadError: true,
  // Whether to prefix tool names with the server name (optional, default: true)
  prefixToolNameWithServerName: true,
  // Optional additional prefix for tool names (optional, default: "mcp")
  additionalToolNamePrefix: "mcp",
  
  // Use standardized content block format in tool outputs
  useStandardContentBlocks: true,

  mcpServers : McpServers,
})
