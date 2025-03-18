/**
 * Mock for @expo/vector-icons
 * 
 * This mock implements a simplified version of the Expo vector icons
 * for use in tests.
 */

const React = require('react');

const createIconSet = () => {
  return function MockIcon(props) {
    return React.createElement('Icon', {
      ...props,
      testID: props.testID || 'mock-icon'
    });
  };
};

const mockImplementation = (Component) => {
  return function MockImplementation(props) {
    return React.createElement(Component, {
      ...props,
      testID: props.testID || 'mock-icon'
    });
  };
};

// Mock all the icon sets
const Feather = createIconSet();
const FontAwesome = createIconSet();
const Ionicons = createIconSet();
const MaterialIcons = createIconSet();
const MaterialCommunityIcons = createIconSet();
const Octicons = createIconSet();
const SimpleLineIcons = createIconSet();
const Entypo = createIconSet();
const AntDesign = createIconSet();
const Foundation = createIconSet();
const Fontisto = createIconSet();
const EvilIcons = createIconSet();
const Zocial = createIconSet();

module.exports = {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
  Entypo,
  AntDesign,
  Foundation,
  Fontisto,
  EvilIcons,
  Zocial,
  createIconSet
};