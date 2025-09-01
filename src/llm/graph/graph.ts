import { START, StateGraph } from "@langchain/langgraph";
import { AgentState } from "../agents/state.js";
import { researcherNode } from "../agents/infoRetrieverAgent/info-retriever-agent.js";
import { docGenNode } from "../agents/communicationAgent/doc-generator-agent.js";
import { members, supervisorChain } from "../agents/supervisorAgent/supervisor-agent.js";

// 1. Create the graph
const workflow = new StateGraph(AgentState)
  // 2. Add the nodes; these will do the work
  .addNode("researcher", researcherNode)
  .addNode("doc_generator", docGenNode)
  .addNode("supervisor", supervisorChain);
// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor
members.forEach((member) => {
  workflow.addEdge(member, "supervisor");
});

workflow.addConditionalEdges(
  "supervisor",
  (x: typeof AgentState.State) => x.next,
);

workflow.addEdge(START, "supervisor");

export const triageGraph = workflow.compile();