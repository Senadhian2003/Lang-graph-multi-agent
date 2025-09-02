import { RunnableConfig } from "@langchain/core/runnables";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state.js";
import { model } from "../../model.js";
import { HumanMessage } from "@langchain/core/messages";
import { documentGeneratorTool } from "./doc-generator-tool.js";
import { client } from "./mcp/mcp-client.js";

const mcpTools = await client.getTools();
console.log("MCP Tools loaded:", mcpTools.map(t => t.name));
const docGenAgent = createReactAgent({
    llm : model,
    tools: [documentGeneratorTool, ...mcpTools],
    stateModifier: new SystemMessage("You excel at generating documents. Use the researcher's information to generate the documents.")
  })
  
export  const docGenNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) => {
    const result = await docGenAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
      messages: [
        new HumanMessage({ content: lastMessage.content, name: "ChartGenerator" }),
      ],
    };
  };