export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/uat/',
    '/tests/playwright/',
    '.*\\.playwright\\.spec\\.ts$',
    '.*\\.playwright\\.test\\.ts$'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }],
    '^.+\\.tsx$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client|@panva|oidc-token-hash|preact-render-to-string|uuid)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/web/client/__mocks__/fileMock.js',
          // NextAuth removed - using JWT authentication
    '^jose$': '<rootDir>/src/web/client/__mocks__/jose.mock.js',
    '^openid-client$': '<rootDir>/src/web/client/__mocks__/openid-client.mock.js'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx'
  ],
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000, // 10 seconds timeout for individual tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironmentOptions: {
    url: 'http://localhost',
    // Add timeout for async operations
    asyncTimeout: 5000
  },
  // Additional timeout settings
  maxWorkers: 1, // Run tests sequentially to avoid resource conflicts
  bail: 1, // Stop on first failure
  verbose: true, // Show detailed output
  // Force Jest to fail fast on timeouts
  forceExit: true,
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between tests
  resetModules: true
}; 