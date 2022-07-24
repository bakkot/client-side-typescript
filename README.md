# Client-side typechecking for Z3

This repository demonstrates how to run TypeScript on code including a library (Z3) at runtime, both [in a browser](https://bakkot.github.io/client-side-typescript/) and through node.

## Setup

```
npm install
```
to install dependencies.

## Building

```
npm run build
```
will build everything.

## Running from node

```
node dist/from-node.js
```
will run the type checker from inside a node script.

## Running from a browser

Open `dist/index.html` in a browser to get an interactive demo.

## Notes

The build process will generate a file named `dist/from-browser.js`, but that isn't usable without bundling. Bundling for the web is done by `esbuild` and outputs to `docs`.

TypeScript is a fairly significant amount of code (3-4 MB, after minification), so you should defer loading it until typechecking is actually requested. The [`src/from-browser.ts`](src/from-browser.ts) script does that.
