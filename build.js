'use strict';
let esbuild = require('esbuild');
let libs = require('./ts-libs.js');

esbuild.build({
  entryPoints: ['src/eval-z3.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/tmp.js',
  define: { TS_LIBS: JSON.stringify(libs) },
  plugins: [],
}).catch(() => process.exit(1));
