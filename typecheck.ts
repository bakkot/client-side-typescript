import * as ts from 'typescript';

function compile(source: string) {
  let options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    lib: ['lib.es2021.d.ts'],
    target: ts.ScriptTarget.ES2020,
    strict: true,
  };
  let createdFiles = { __proto__: null };

  let files = {
    __proto__: null,
    // @ts-ignore esbuild will define this for us
    ...TS_LIBS,
    'main.ts': source,
  };

  let host: ts.CompilerHost = {
    readFile: fileName => {
      // console.log('reading', fileName);
      if (fileName in files) {
        return files[fileName];
      }
      return undefined;
    },
    writeFile: (fileName, content) => {
      createdFiles[fileName] = content;
    },
    getSourceFile: (fileName, languageVersion) => {
      let sourceText = host.readFile(fileName);
      return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined;
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    getCurrentDirectory: () => '/',
    getDirectories,
    getCanonicalFileName: fileName => fileName,
    getNewLine: () => '\n',
    useCaseSensitiveFileNames: () => true,
    fileExists: (fileName) => {
      // TODO
      // console.log('checking', fileName);
      return false;
    },
    resolveModuleNames,
  };

  // TODO
  function getDirectories(path: string) {
    console.log('getting directories for', path);
    return [];
  }

  function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
    // console.log('resolving', moduleNames, 'for', containingFile);
    return moduleNames.map(name => {
      if (name === 'z3-solver') {
        return {
          resolvedFileName: '/node_modules/z3-solver/build/browser.d.ts',
          isExternalLibraryImport: true,
        };
      } else if (containingFile.startsWith('/node_modules/z3-solver/build/')) {
        // this is only a small portion of TypeScript's resolution algorithm
        // but it's sufficient for the files in z3-solver
        let root = containingFile.split('/').slice(0, -1).join('/');
        let joined = root + '/' + name;
        joined = joined.replace(/(\/[^/]+\/\.\.\/)|(\/\.\/)/g, '/');
        for (let suffix of ['', '.d.ts', '/index.d.ts']) {
          let candidate = joined + suffix;
          if (candidate in files) {
            return {
              resolvedFileName: candidate,
              isExternalLibraryImport: false,
            };
          }
        }
        throw new Error(`relative import of z3-solver internal file ${name} for ${containingFile} failed`);
      }
      throw new Error(`could not find module ${name}`);
    });
  }

  let program = ts.createProgram(['main.ts'], options, host);

  let emitResult = program.emit();
  let diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .map(diagnostic => {
      if (diagnostic.file) {
        // TODO fixup line numbers
        let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
      } else {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      }
    });

  if (diagnostics.length > 0) {
    return { success: false, message: diagnostics.join('\n') };
  }
  if (emitResult.emitSkipped || !('main.js' in createdFiles)) {
    return { success: false, message: 'typechecking failed with unknown error' };
  }
  return { success: true, result: createdFiles['main.js'] };
}

console.log(
  compile(`
import type { init as initT } from 'z3-solver';
declare let init: typeof initT;
  let x: Promise<number> = init();
`),
);
