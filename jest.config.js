module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globalSetup: "<rootDir>/tests/setup-env.ts",
  moduleNameMapper: {
    'nodejs-layer': '<rootDir>/src/layer/nodejs-layer',
  },
};
