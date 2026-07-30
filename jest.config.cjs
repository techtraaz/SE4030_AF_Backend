module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.js", "**/tests/integration/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  // Integration tests hit real (in-memory) MongoDB — allow extra time
  testTimeout: 30000,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  collectCoverageFrom: [
    "src/controller/**/*.js",
    "src/service/**/*.js",
    "src/middleware/**/*.js",
    "!src/**/*.test.js",
  ],
  clearMocks: true,
};
