import { terser } from 'rollup-plugin-terser';

export default {
  input: ['src/app.js'],
  output: {
    dir: 'lib/',
    format: 'esm',
    sourcemap: true
  },
  plugins: [terser()]
};
