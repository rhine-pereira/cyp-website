import { Client, Storage, ID } from 'node-appwrite';

// Server-side Appwrite client (node-appwrite)
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
  .setProject(process.env.APPWRITE_PROJECT_ID as string)
  .setKey(process.env.APPWRITE_API_KEY as string);

export const storage = new Storage(client);
export { ID };
