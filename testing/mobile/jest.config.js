/**
 * Jest configuration for React Native component testing
 * 
 * This configuration is specifically designed for testing React Native components
 * in the Stripe Connect Marketplace application.
 */

module.exports = {
  // Using our own configuration instead of react-native preset to avoid Flow type issues
  // preset: 'react-native',
  
  // The root directory that Jest should scan for tests and modules
  rootDir: '../../',
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // A list of paths to directories that Jest should use to search for files in
  testMatch: [
    '<rootDir>/testing/mobile/components/**/*.test.js',
    '<rootDir>/testing/mobile/screens/**/*.test.js',
    '<rootDir>/testing/mobile/contexts/**/*.test.js',
    '<rootDir>/testing/mobile/navigation/**/*.test.js'
  ],
  
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/testing/mobile/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/testing/mobile/__mocks__/styleMock.js',
    '@react-native/js-polyfills/error-guard': '<rootDir>/testing/mobile/__mocks__/@react-native/js-polyfills/error-guard.js'
  },
  
  // Transform ignore patterns to exclude node_modules except certain packages
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|expo|@expo|@react-native-async-storage|react-native-safe-area-context|@stripe|react-native-webview)/'
  ],
  
  // Setup files to run before each test
  setupFiles: ['<rootDir>/testing/mobile/setup.js'],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: '<rootDir>/testing/coverage',
  
  // An array of regexp pattern strings that should be skipped when collecting coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/testing/mobile/__mocks__/'
  ],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Use the babel config defined in this file
  globals: {
    'babel-jest': {
      presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
        '@babel/preset-react',
        'module:metro-react-native-babel-preset',
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-flow-strip-types',
        '@babel/plugin-transform-react-jsx'
      ]
    }
  },
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The directory where Jest should store its cached dependency information
  cacheDirectory: '<rootDir>/testing/.jest-cache'
};