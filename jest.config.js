module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'text-summary'],
  testEnvironment: 'jsdom',
  // setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.spec.{tsx,ts}'],
  testPathIgnorePatterns: ['<rootDir>/types/'],
  // moduleNameMapper: {
  //   'react-query': '<rootDir>/src/index.ts',
  // },
  transformIgnorePatterns: [
    "/node_modules/",
    "\\.pnp\\.[^\\/]+$"
  ],
}