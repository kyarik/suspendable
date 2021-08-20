/* eslint-disable @typescript-eslint/naming-convention */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import type { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const env = process.env.NODE_ENV;

const extensions = ['.ts', '.tsx'];

const config: RollupOptions = {
  input: 'src/index.ts',
  external: Object.keys(pkg.peerDependencies).concat('react-dom'),
  output: {
    format: 'umd',
    name: 'Suspendable',
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
  },
  plugins: [
    nodeResolve({
      extensions,
    }),
    babel({
      include: 'src/**/*',
      exclude: '**/node_modules/**',
      babelHelpers: 'runtime',
      extensions,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      'preventAssignment': true,
    }),
    commonjs(),
  ],
};

if (env === 'production') {
  config.plugins?.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
      },
    }),
  );
}

export default config;
