import { BlobServiceClient } from "@azure/storage-blob";
import { azureBlobContainer,azureStorageConnectionString } from "../constants/app-constants.js";

const AZURE_STORAGE_CONNECTION_STRING = azureStorageConnectionString;
const CONTAINER_NAME: string = azureBlobContainer;

export async function uploadToBlobStorage(fileName: string, buffer: any) {

console.log("Azure Storage Connection String:", AZURE_STORAGE_CONNECTION_STRING);
console.log("Azure Blob Container Name:", CONTAINER_NAME);

  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage connection string is not set.");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  // Create container if it doesn't exist
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
  });

  console.log(`✅ File uploaded to Azure Blob Storage: ${fileName}`);
  const fileUrl = blockBlobClient.url;
  console.log(`File URL: ${fileUrl}`);
  return fileUrl;
}
