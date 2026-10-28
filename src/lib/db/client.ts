import "server-only";
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

const globalForMongo = globalThis as unknown as {
  mongoClient?: Promise<MongoClient>;
};

/**
 * One MongoClient per process. In development the client is kept on
 * globalThis so hot reloads don't open a new pool on every edit.
 */
function getClient(): Promise<MongoClient> {
  if (!globalForMongo.mongoClient) {
    const { MONGODB_URI } = env("database");
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      appName: "bloodlink",
    });
    globalForMongo.mongoClient = client.connect().catch((error: unknown) => {
      globalForMongo.mongoClient = undefined;
      throw error;
    });
  }
  return globalForMongo.mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(env("database").MONGODB_DB);
}
