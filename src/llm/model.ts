
import { AzureChatOpenAI } from "@langchain/openai";
import { azureApiInstanceName, azureApiKey,  azureApiVersion, azureDeploymentName } from "../constants/app-constants.js";
import { tools } from "./tools/index.js";


export const model = new AzureChatOpenAI({
    azureOpenAIApiKey: azureApiKey,
    azureOpenAIApiInstanceName: azureApiInstanceName,
    azureOpenAIApiDeploymentName: azureDeploymentName,
    azureOpenAIApiVersion: azureApiVersion,
  })

export const boundModel = model.bindTools(tools);