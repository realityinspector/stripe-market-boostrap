/**
 * Jest configuration for React Native component testing
 * 
 * This configuration is specifically designed for testing React Native components
 * in the Stripe Connect Marketplace application.
 */

module.exports = {
  preset: 'react-native',
  
  // Where to find test files
  testMatch: [
    '**/testing/mobile/**/*.test.js',
    '**/testing/mobile/**/*.spec.js'
  ],
  
  // Transform files with Babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Ignore node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|@stripe|expo|@expo))'
  ],
  
  // Setup files
  setupFiles: [
    './testing/mobile/setup.js'
  ],
  
  // Setup after environment is loaded
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  
  // Code coverage configuration
  collectCoverageFrom: [
    'mobile/**/*.{js,jsx}',
    '!mobile/**/*.config.js',
    '!mobile/constants/**',
    '!**/node_modules/**'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage/mobile',
  
  // Mock file and asset imports
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/testing/mobile/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/testing/mobile/__mocks__/styleMock.js'
  },
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Test environment
  testEnvironment: 'node',
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Globals available in tests
  globals: {
    __DEV__: true
  }
};