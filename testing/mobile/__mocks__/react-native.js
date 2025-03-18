/**
 * React Native Mock
 * 
 * This file provides a comprehensive mock implementation of React Native
 * for use in Jest tests. It includes all commonly used components and APIs.
 */

'use strict';

// Create a basic mock for React Native
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
  
  // StyleSheet implementation
  StyleSheet: {
    create: (styles) => styles,
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    flatten: (style) => style,
  },
  
  // Platform detection
  Platform: {
    OS: 'ios',
    Version: 42,
    select: (obj) => obj.ios || obj.default,
    isTesting: true,
  },
  
  // Dimensions API
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375, height: 667, scale: 2, fontScale: 1 }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // Animated API (simplified)
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    createAnimatedComponent: jest.fn(component => `Animated.${component}`),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
      stopAnimation: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    decay: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
    })),
    stagger: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    event: jest.fn(() => jest.fn()),
  },
  
  // UI Manager
  UIManager: {
    measure: jest.fn((node, callback) => callback(0, 0, 100, 100, 0, 0)),
    measureInWindow: jest.fn((node, callback) => callback(0, 0, 100, 100)),
    measureLayout: jest.fn((node, relativeNode, errorCallback, callback) => 
      callback(0, 0, 100, 100)
    ),
    updateView: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn(),
    viewIsDescendantOf: jest.fn(() => true),
    configureNext: jest.fn(cb => cb && cb()),
    manageChildren: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
  },
  
  // Native Modules (empty implementation)
  NativeModules: {
    UIManager: {
      getViewManagerConfig: jest.fn(() => null),
      createView: jest.fn(),
      updateView: jest.fn(),
    },
    StatusBarManager: {
      getHeight: jest.fn((callback) => callback(null, 20)),
      setStyle: jest.fn(),
      setHidden: jest.fn(),
    },
    LinkingManager: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
    },
  },
  
  // Additional utilities
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
  },
  
  // Component creation
  requireNativeComponent: jest.fn(() => 'NativeComponent'),
  findNodeHandle: jest.fn(() => 1),
  processColor: jest.fn(() => 0),
  
  // Layout Animation
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: {
      spring: 'spring',
      linear: 'linear',
      easeInEaseOut: 'easeInEaseOut',
      easeIn: 'easeIn',
      easeOut: 'easeOut',
    },
    Properties: {
      opacity: 'opacity',
      scaleX: 'scaleX',
      scaleY: 'scaleY',
      scaleXY: 'scaleXY',
    },
    Presets: {
      easeInEaseOut: {},
      linear: {},
      spring: {},
    },
  },
};

module.exports = reactNative;