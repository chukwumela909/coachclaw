import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define your MONGODB_URI environment variable");
}

const mongoUri = MONGODB_URI;

/**
 * MongoDB client with a connection pooling mechanism.
 * This is used by the NextAuth adapter to manage database connections.
 */
let cachedClient: MongoClient | null = null;
let cachedClientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!cachedClientPromise) {
    cachedClientPromise = MongoClient.connect(mongoUri, {
      // Standard MongoDB connection options
    });
  }

  try {
    cachedClient = await cachedClientPromise;
  } catch (e) {
    cachedClientPromise = null;
    throw e;
  }

  return cachedClient;
}
