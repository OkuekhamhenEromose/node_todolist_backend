module.exports = {
  // Use Node.js environment (not jsdom, which is for frontend)
  testEnvironment: "node", // testEnvironment: 'node'? Jest defaults to jsdom (browser simulation). Our backend runs in Node.js.

  // Run this file after Jest is initialized, before tests
  setupFilesAfterEnv: ["./src/tests/setup.js"], // etupFilesAfterEnv? This points to our test setup file that connects to the in-memory MongoDB before all tests and cleans up after.

  // Only files matching this pattern are considered tests
  testMatch: ["**/tests/**/*.test.js"],

  // Verbose output shows each test name
  verbose: true,

  // Force exit after all tests complete (prevents hanging from open handles)
  forceExit: true,

  // Clear mock call counts between tests
  clearMocks: true,
};
