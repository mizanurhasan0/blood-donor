import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src/", import.meta.url));
const serverOnlyStub = fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: src },
      // The real package throws outside a React Server environment.
      { find: /^server-only$/, replacement: serverOnlyStub },
    ],
  },
  test: {
    environment: "node",
    // Restores anything a test changes with vi.stubEnv().
    unstubEnvs: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["tests/unit/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          // Starts one in-memory mongod for the run; each test file gets its own database.
          globalSetup: ["tests/integration/global-setup.ts"],
          setupFiles: ["tests/integration/setup.ts"],
          testTimeout: 20_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
