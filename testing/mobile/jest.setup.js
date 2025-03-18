/**
 * Jest Setup File for React Native Testing
 * 
 * This file configures the Jest environment specifically for React Native testing.
 * It defines global variables, sets up mocks, and handles other environment-specific configurations.
 */

// Set up global variables needed by React Native
global.__DEV__ = true;

// Mock critical React Native modules without using specific paths
jest.mock('react-native', () => {
  const reactNative = {
    // Core components
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    Image: 'Image',
    TouchableOpacity: 'TouchableOpacity',
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    SafeAreaView: 'SafeAreaView',
    ActivityIndicator: 'ActivityIndicator',
    
    // APIs
    StyleSheet: {
      create: (styles) => styles,
      flatten: jest.fn((style) => style),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({width: 375, height: 667}),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      createAnimatedComponent: jest.fn(component => component),
    },
    
    // Native modules and UI
    UIManager: {
      measureInWindow: jest.fn(),
      measure: jest.fn(),
      measureLayout: jest.fn(),
    },
    NativeModules: {},
    requireNativeComponent: jest.fn(() => 'NativeComponent'),
  };
  
  return reactNative;
});

// Set up ResizeObserver mock (required for some React Native components)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Set up any other environment variables needed for testing
process.env.NODE_ENV = 'test';