/**
 * React Native Test Setup
 * 
 * This file contains setup code that runs before all tests in the React Native
 * testing environment. It sets up mocks for React Native-specific APIs and libraries.
 */

// Mock React Native modules that aren't available in the test environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo components and APIs
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      stripePublishableKey: 'pk_test_mock',
    },
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  
  return Reanimated;
});

// Mock @react-navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: () => true,
  };
});

// Mock the Stripe React Native module
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockReturnValue({ error: null }),
    presentPaymentSheet: jest.fn().mockReturnValue({ error: null }),
    confirmPayment: jest.fn().mockReturnValue({ error: null, paymentIntent: { id: 'test_payment_intent' } }),
  }),
  StripeProvider: ({ children }) => children,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation((url) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    headers: new Headers(),
  });
});

// Mock dimensions for responsive design testing
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Set up global test environment variables
global.__DEV__ = true;

// Silence console warnings and errors during tests
// Uncomment these for cleaner test output, but be sure to check warnings/errors if tests fail
// console.warn = jest.fn();
// console.error = jest.fn();