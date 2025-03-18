/**
 * Babel configuration for React Native component testing
 */

module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-react',
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-flow-strip-types'
  ]
};