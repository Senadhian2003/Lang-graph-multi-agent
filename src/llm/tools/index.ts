import { documentGeneratorTool } from "../agents/communicationAgent/doc-generator-tool.js";
import { tavilySearchTool } from "../agents/infoRetrieverAgent/info-retriver-tool.js";

export const tools = [tavilySearchTool, documentGeneratorTool]