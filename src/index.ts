import express, { Request, response, Response } from "express";
import { langGraph } from "./lang-graph/app.js";
import { BaseMessage, HumanMessage, RemoveMessage, filterMessages} from "@langchain/core/messages";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { pool } from "./pg-sql/pg-connection.js";
import {v4 as uuidv4} from "uuid";
import { triageGraph } from "./llm/graph/graph.js";

const app = express();


const executionControllers = new Map<string, AbortController>();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});


app.post("/chat", async (req: Request, res: Response) => {
  const { query, threadId } = req.body;

  console.log("Received message:", query);
  console.log("Received threadId:", threadId);
  // const controller = new AbortController();
  // console.log(controller)
  
  // executionControllers.set(threadId, controller);
  // const config = { configurable: { thread_id: threadId },signal: controller.signal, };
  const message = new HumanMessage({
    id: uuidv4(),
    content: query,
  });
 
  const response = await triageGraph.invoke({ messages: [message] },  { recursionLimit: 100 });
  console.log("Response:", response.messages[response.messages.length - 1].content);
  res.send({
    response: response.messages[response.messages.length - 1].content,
  });
});

app.post("/stop", (req: Request, res: Response) => {
  const { threadId } = req.body;
  const controller = executionControllers.get(threadId);

  if (controller) {
    controller.abort();
    console.log(`Execution for thread ${threadId} stopped.`);
    res.json({ message: `Execution for thread ${threadId} stopped.` });
  } else {
    res.status(404).json({ error: `No active execution for thread ${threadId}.` });
  }
});

app.post("/chat/:threadId", async(req: Request, res: Response) => {
  const { threadId } = req.params;
  const checkpointer = new PostgresSaver(pool);
  const config = { configurable: { thread_id: threadId } };
  // const messages = checkpointer.list(config)
  console.log(`Received thread ${threadId}`);
  // const messages =  await checkpointer.get(config);
  let messages =  (await langGraph.getState(config)).values.messages;
  const filteredMesagesResponse = filterMessages(messages, {
    includeTypes : ["human", "ai"],
  })

  const filteredMesagesWithAiResponseResponse = filteredMesagesResponse.filter((message: BaseMessage) => !!message.content );

  console.log("Messages:", messages);

  


  res.send({
    response: filteredMesagesWithAiResponseResponse,
  })
});

app.put("/chat/:threadId", async(req: Request, res: Response) => {
  const { threadId } = req.params;
  console.log(`Received thread ${threadId}`);
  const {messageId, updateQuery} = req.body;
  console.log(`Received messageId: ${messageId}\n Received updateQuery: ${updateQuery}`);
  const config = { configurable: { thread_id: threadId } };
  

  let messages =  (await langGraph.getState(config)).values.messages;
  console.log("Messages before update:", messages);
  

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    
    await langGraph.updateState(config, {
      messages: new RemoveMessage({ id: msg.id }),
    });
  
    if (msg._getType?.() === 'human') {
      console.log(`Deleted last HumanMessage at index ${i}`);
      break;
    }
  }
  let deletedMessages =  (await langGraph.getState(config)).values.messages;
  console.log("Messages after deletion:", deletedMessages);

    const humanMessage : BaseMessage = new HumanMessage({
      id: messageId,
      content: updateQuery,
    })

 

    const response = await langGraph.invoke({ messages: [humanMessage] }, config);
  
  res.send({
    response: response,
  })
});


app.put("/chat/delete/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  console.log(`Received thread ${threadId} for deletion`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete from checkpoint_writes
    await client.query('DELETE FROM checkpoint_writes WHERE thread_id = $1', [threadId]);

    // Delete from checkpoint_blobs
    await client.query('DELETE FROM checkpoint_blobs WHERE thread_id = $1', [threadId]);

    // Delete from checkpoint
    await client.query('DELETE FROM checkpoints WHERE thread_id = $1', [threadId]);

    await client.query('COMMIT');
    console.log(`Successfully deleted data for thread ${threadId}`);
    res.status(200).json({ message: 'Thread data deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting thread data:', error);
    res.status(500).json({ error: 'An error occurred while deleting thread data' });
  } finally {
    client.release();
  }
});

app.listen(3002, () => {
  console.log("Server is running on port 3002");
});
