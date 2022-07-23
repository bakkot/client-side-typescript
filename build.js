'use strict';
let fs = require('fs');
let path = require('path');
let esbuild = require('esbuild');
let ts = require('typescript');
let { createMinifier } = require('dts-minify');

let dtsMinfier = createMinifier(ts);
let files = {};
let tslibPath = path.join(__dirname, 'node_modules/typescript/lib');
for (let lib of fs.readdirSync(tslibPath)) {
  if (!/^lib\..*\.d\.ts$/.test(lib) || lib.includes('.dom.')) {
    continue;
  }
  let contents = fs.readFileSync(path.join(tslibPath, lib), 'utf8');
  files[lib.split('/').at(-1)] = dtsMinfier.minify(contents);
}

esbuild.build({
  entryPoints: ['test.ts'],
  bundle: true,
  outfile: 'test.js',
  banner: { js: 'process.browser=true;' },
  define: { TS_LIBS: JSON.stringify(files) },
  plugins: [],
}).catch(() => process.exit(1));
