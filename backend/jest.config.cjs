/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  // point Jest at your backend code & tests
  roots: ["<rootDir>"],
  testMatch: [
    "<rootDir>/tests/**/*.test.[jt]s?(x)",
    "<rootDir>/__tests__/**/*.test.[jt]s?(x)"
  ],
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
  coverageReporters: ["lcov", "text", "text-summary"]
};
