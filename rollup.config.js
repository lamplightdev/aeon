import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: ['src/aeon.js'],
    output: {
      dir: 'dist/',
      format: 'esm',
      sourcemap: true
    },
    plugins: [terser()]
  },
  {
    input: ['src/aeon.js'],
    output: {
      file: 'dist/aeon-es5.js',
      format: 'umd'
    },
    plugins: [babel(), terser()]
  }
];
