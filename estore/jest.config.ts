import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": ["<rootDir>/src/$1", "<rootDir>/$1"],
  },
};

export default createJestConfig(config);
