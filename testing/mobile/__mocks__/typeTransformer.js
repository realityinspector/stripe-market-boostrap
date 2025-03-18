/**
 * Flow Type Transformer for Jest
 * 
 * This transformer strips Flow type annotations from source files
 * before they are processed by Jest.
 */

const { transformSync } = require('@babel/core');

module.exports = {
  process(src, filename) {
    const result = transformSync(src, {
      filename,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        'module:metro-react-native-babel-preset'
      ],
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        '@babel/plugin-proposal-class-properties'
      ],
      babelrc: false,
      configFile: false,
    });

    return {
      code: result?.code || src,
      map: result?.map
    };
  },
};