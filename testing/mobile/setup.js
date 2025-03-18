/**
 * Mobile Testing Setup
 * 
 * This file configures the testing environment for React Native component tests.
 * It handles mocking of native modules, setting up global variables, and polyfills.
 */

// Mock the Expo components and APIs
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: jest.fn(() => true),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
}));

// Mock Stripe components if needed
jest.mock('@stripe/react-stripe-js', () => ({
  CardElement: () => null,
  Elements: ({ children }) => children,
  useStripe: () => ({
    createToken: jest.fn(() => Promise.resolve({ token: { id: 'mock_token_id' } })),
  }),
}));

// Mock the Feather icon from Expo
jest.mock('@expo/vector-icons', () => ({
  Feather: () => 'Icon',
}));

// Add any global mocks or polyfills needed for testing
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
);

// Suppress React Native warnings during tests
console.error = jest.fn();
console.warn = jest.fn();