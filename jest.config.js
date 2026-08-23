module.exports = {
  // Use Node.js environment (not jsdom, which is for frontend)
  testEnvironment: 'node',

  // Run this file after Jest is initialized, before tests
  setupFilesAfterEnv: ['./src/tests/setup.js'],

  // Only files matching this pattern are considered tests
  testMatch: ['**/tests/**/*.test.js'],

  // Verbose output shows each test name
  verbose: true,

  // Force exit after all tests complete (prevents hanging from open handles)
  forceExit: true,

  // Clear mock call counts between tests
  clearMocks: true,
}
