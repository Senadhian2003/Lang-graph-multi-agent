import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get Azure OpenAI configuration
export const azureApiKey = process.env.DEV_AZURE_OPENAI_API_KEY;
export const azureApiVersion = process.env.DEV_AZURE_OPENAI_API_VERSION;
export const azureDeploymentName = process.env.DEV_AZURE_OPENAI_DEPLOYMENT_NAME;
export const azureApiInstanceName = process.env.DEV_AZURE_OPENAI_INSTANCE_NAME;
export const azureEndpoint = process.env.DEV_AZURE_OPENAI_ENDPOINT;

// Get Tavily API key
export const tavilyApiKey = process.env.TAVILY_API_KEY;

// Azure Blob Storage configuration
export const azureBlobContainer = process.env.AZURE_BLOB_CONTAINER || "documents";
export const azureStorageConnectionString = process.env.AZURE_BLOB_CONNECTION_STRING;