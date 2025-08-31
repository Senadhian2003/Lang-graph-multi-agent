
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { boundModel } from "../llm/model.js";

import { formatToolCall } from "../utils/logging.js";

// Memory for the lang graph
import { MemorySaver } from "@langchain/langgraph";

import {pool} from "../pg-sql/pg-connection.js"
import { BASE_AGENT_PROMPT } from "../prompts/index.js";
import { tools } from "../llm/tools/index.js";

class LoggingToolNode extends ToolNode {
  private callCount = 0;

  async invoke(state: any, config?: Record<string, unknown>) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    
    if (lastMessage.tool_calls) {
      const toolCalls = lastMessage.tool_calls.map((toolCall: any) => {
        this.callCount++;
        return {
          number: this.callCount,
          timestamp: new Date().toISOString(),
          name: toolCall.name,
          args: toolCall.args,
        };
      });
      
      // Log the tool calls using the formatToolCall function
      toolCalls.forEach(call => {
        console.log(formatToolCall(call.name, call.args, call.number));
      });
    }
    
    return super.invoke(state, config);
  }
}

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
  
    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return "__end__";
  }

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage({ content: BASE_AGENT_PROMPT });

  const messagesWithSystem = [systemMessage, ...state.messages];

  const response = await boundModel.invoke(messagesWithSystem);

  return { messages: [response] };
}

const toolNode = new LoggingToolNode(tools);
// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);


// // Add memory to the graph
// const memory = new MemorySaver();

export async function setupMemory() {
  const checkpointer = new PostgresSaver(pool);
  await checkpointer.setup();
  return checkpointer;
  
}

const memoryCheckpointer = await setupMemory()
export const langGraph = workflow.compile({
  checkpointer: memoryCheckpointer,
});




// const checkpointer = new PostgresSaver(pool);
// await checkpointer.setup();

// export const langGraph = workflow.compile({
//   checkpointer: checkpointer,
// });
