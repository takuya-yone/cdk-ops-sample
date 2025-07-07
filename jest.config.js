const { pathsToModuleNameMapper } = require("ts-jest");
const { readFileSync } = require("fs");
const { parse } = require("jsonc-parser");
// tsconfig.jsonからpathを取得
// https://zenn.dev/no4_dev/articles/15ba046e245ba090a3a3-2
const { compilerOptions } = parse(readFileSync("tsconfig.json").toString());
const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" });

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globalSetup: "<rootDir>/tests/setup-env.ts",
  moduleNameMapper:moduleNameMapper
};
