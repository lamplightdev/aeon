import { terser } from 'rollup-plugin-terser';

export default {
  input: ['src/aeon.js'],
  output: {
    dir: 'dist/',
    format: 'esm',
    sourcemap: true
  },
  plugins: [terser()]
};
