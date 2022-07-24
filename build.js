'use strict';
let esbuild = require('esbuild');
let libs = require('./ts-libs.js');

esbuild
  .build({
    entryPoints: ['src/eval-z3.ts'],
    bundle: true,
    minify: true,
    globalName: 'evalZ3Mod',
    outfile: './docs/eval-z3.js',
    define: {
      TS_LIBS: JSON.stringify(libs),
    },
    plugins: [],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ['src/from-browser.ts'],
    bundle: true,
    minify: true,
    outfile: './docs/from-browser.js',
    define: {
      global: 'window', // todo fix this https://github.com/Z3Prover/z3/blob/3e38bbb0094e97177d477156e356efbbfb2f7a5c/src/api/js/src/browser.ts#L8
    },
    plugins: [],
  })
  .catch(() => process.exit(1));
