import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { tavilyApiKey } from "../../../constants/app-constants.js";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
// export const tavilySearchTool =  new TavilySearchResults({ maxResults: 3, apiKey: tavilyApiKey });

const seachSchema = z.object({
  searchInput: z.string().describe("The input topic that needs to be searched about from the internet"),
});

// export const tavilySearchTool = tool(
//   async ({searchInput}): Promise<string> => {
//    const tavily =  new TavilySearchResults({ maxResults: 3, apiKey: tavilyApiKey });
//    const results = await tavily.call(searchInput); // This triggers the actual search
//    console.log("Search Results:", results);
//    return results;
//   },
//   {
//     name: "internetSearchTool",
//     description: "Search the internet for information about a topic",
//     schema: seachSchema,
//   }
// );

export const tavilySearchTool = new TavilySearch();
