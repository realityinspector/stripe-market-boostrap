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

// Mock the expo vector icons
jest.mock('@expo/vector-icons', () => require('../mobile/__mocks__/expo-vector-icons'));

// Add any global mocks or polyfills needed for testing
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
);

// Mock react-native modules that might cause TypeScript/Flow issues
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => 'TouchableOpacity');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  
  // Mock the problematic modules
  return Object.assign({}, ReactNative, {
    NativeModules: {
      ...ReactNative.NativeModules,
      RNGestureHandlerModule: {
        attachGestureHandler: jest.fn(),
        createGestureHandler: jest.fn(),
        dropGestureHandler: jest.fn(),
        updateGestureHandler: jest.fn(),
        State: {},
        Directions: {},
      },
      UIManager: {
        RCTView: () => ({}),
        RCTText: () => ({}),
        createView: jest.fn(),
        updateView: jest.fn(),
        manageChildren: jest.fn(),
      },
    },
    UIManager: {
      RCTView: () => ({}),
      RCTText: () => ({}),
      customBubblingEventTypes: {},
      customDirectEventTypes: {},
      measureInWindow: jest.fn(),
      measure: jest.fn(),
      measureLayout: jest.fn(),
    },
    StyleSheet: {
      ...ReactNative.StyleSheet,
      create: styles => styles,
    },
    requireNativeComponent: jest.fn(() => 'NativeComponent'),
  });
});

// Mock React Native's flow types
jest.mock('@react-native/js-polyfills/error-guard', () => ({
  ErrorUtils: {
    setGlobalHandler: jest.fn(),
    reportError: jest.fn(),
  },
}));

// Suppress React Native warnings during tests
console.error = jest.fn();
console.warn = jest.fn();