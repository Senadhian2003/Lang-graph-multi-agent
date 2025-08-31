

import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { model } from "../model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MARKDOWN_TOOL_PROMPT } from "../../prompts/index.js";
import { md2docx } from '@adobe/helix-md2docx';
import fs from "fs";
import path from "path";
const essayGeneratorToolSchema = z.object({
   content : z.string().describe("The the raw information about the topic that needs to be converted into an essay"),
});

export const essayGeneratorTool = tool(
  async ({content}): Promise<string> => {
    console.log("Content:", content);
    const response = await model.invoke([
        new SystemMessage(MARKDOWN_TOOL_PROMPT),
        new HumanMessage(`Create an essay for this content: ${content} `),
      ]);
    const markdownResponse = response.content as string
    console.log("Markdown Response:", markdownResponse);
    const buffer = await md2docx(markdownResponse);

 // Ensure generatedDocuments folder exists
 const folderPath = path.join(process.cwd(), "generatedDocuments");
 if (!fs.existsSync(folderPath)) {
   fs.mkdirSync(folderPath, { recursive: true });
 }
  
    // Create unique filename with timestamp
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-"); 
    const fileName = `GeneratedDocument_${dateStr}.docx`;
     // Save file locally in current working directory
     const filePath = path.join(folderPath, fileName);
     fs.writeFileSync(filePath, buffer);
    return "Document generated successfully and saved in local storage at " + filePath;

  },
  {
    name: "essayTool",
    description: "Only use this tool when the user explicitly asks to generate an essay or a document or structured markdown content.",
    schema: essayGeneratorToolSchema,
  }
);

