/**
 * Jest Setup File for React Native Testing
 * 
 * This file configures the Jest environment specifically for React Native testing.
 * It defines global variables, sets up mocks, and handles other environment-specific configurations.
 */

// Set up global variables needed by React Native
global.__DEV__ = true;

// Set up common mocks for React Native environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set up any additional React Native mocks as needed
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Set up ResizeObserver mock (required for some React Native components)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Set up any other environment variables needed for testing
process.env.NODE_ENV = 'test';