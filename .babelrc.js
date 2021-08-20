const { BABEL_ENV, NODE_ENV } = process.env;

const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        bugfixes: true,
        loose: true,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    'babel-plugin-dev-expression',
    '@babel/transform-react-jsx',
    cjs && ['@babel/transform-modules-commonjs'],
    [
      '@babel/transform-runtime',
      {
        useESModules: !cjs,
        version: require('./package.json').dependencies['@babel/runtime'].replace(/^[^0-9]*/, ''),
      },
    ],
  ].filter(Boolean),
  assumptions: {
    enumerableModuleMeta: true,
  },
};
