// see https://github.com/rozek/build-configuration-study

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/y-localstorage.ts',
  output: [
    {
      file:     './dist/y-localstorage.js',
      format:   'umd', // builds for both Node.js and Browser
      name:     'yLocalStorage', // required for UMD modules
      sourcemap:true,
      plugins: [terser({ format:{ comments:false, safari10:true } })],
    },{
      file:     './dist/y-localstorage.esm.js',
      format:   'esm',
      sourcemap:true,
    }
  ],
  plugins: [
    typescript(),
  ],
};