import { RunnableConfig } from "@langchain/core/runnables";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { tavilySearchTool } from "./info-retriver-tool.js";
import { AgentState } from "../state.js";
import { model } from "../../model.js";
import { HumanMessage } from "@langchain/core/messages";
// Recall llm was defined as ChatOpenAI above
// It could be any other language model
const researcherAgent = createReactAgent({
  llm : model,
  tools: [tavilySearchTool],
  stateModifier: new SystemMessage("You are a web researcher. You may use the Tavily search engine to search the web for" +
    " important information, so the Chart Generator in your team can make useful plots.")
})

export const researcherNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig,
) => {
  const result = await researcherAgent.invoke(state, config);
  const lastMessage = result.messages[result.messages.length - 1];
  return {
    messages: [
      new HumanMessage({ content: lastMessage.content, name: "Researcher" }),
    ],
  };
};