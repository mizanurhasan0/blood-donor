import { MongoMemoryServer } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

/**
 * Starts one real, throwaway mongod for the whole integration run. The first
 * run downloads the binary from MongoDB's CDN into node_modules/.cache.
 * Each test file then works in its own database (see setup.ts).
 */
export default async function setup(project: TestProject) {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  project.provide("mongoUri", uri);
  return async () => {
    await mongod.stop();
  };
}
