/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  // Point Jest at your backend code & tests
  roots: ["<rootDir>"],
  testMatch: [
    "<rootDir>/tests/**/*.test.[jt]s?(x)",
    "<rootDir>/__tests__/**/*.test.[jt]s?(x)"
  ],

  // Ensure NODE_ENV=test (so DB init guards don't exit the process)
  setupFiles: ["<rootDir>/jest.setup-env.js"],

  // Ignore generated folders
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/", "/coverage/"],

  // ---- coverage setup
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "server/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"],

  // Optional niceties
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"]
};
