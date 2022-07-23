import * as ts from 'typescript';

function createCompilerHost(options: ts.CompilerOptions, moduleSearchLocations: string[]): ts.CompilerHost {
  let host: ts.CompilerHost = {
    getSourceFile,
    getDefaultLibFileName: () => 'lib.d.ts',
    readFile: () => {
      throw new Error('redefine me');
    },
    writeFile: () => {
      throw new Error('redefine me');
    },
    getCurrentDirectory: () => '/',
    getDirectories,
    getCanonicalFileName: fileName => fileName,
    getNewLine: () => '\n',
    useCaseSensitiveFileNames: () => true,
    fileExists,
    resolveModuleNames,
  };

  function getDirectories(path: string) {
    console.log('getting directories for', path);
    return [];
  }

  function fileExists(fileName: string): boolean {
    // console.log('checking', fileName);
    return false;
  }

  function getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
    // console.log('getting source file', fileName);
    let sourceText = host.readFile(fileName);
    return sourceText !== undefined
      ? ts.createSourceFile(fileName, sourceText, languageVersion)
      : undefined;
  }

  function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
    console.log('resolving', moduleNames, 'for', containingFile);
    return [];
  }

  return host;
}

let files = {
  __proto__: null,
  // @ts-ignore esbuild will define this for us
  ...TS_LIBS,
  'main.ts': 'let x: string = Math.random();',
};

function compile(sourceFiles: string[], moduleSearchLocations: string[]) {
  let options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    lib: ['lib.es2021.d.ts'],
    target: ts.ScriptTarget.ES2020,
  };
  let host = createCompilerHost(options, moduleSearchLocations);
  let createdFiles = { __proto__: null };

  host.readFile = function readFile(fileName: string): string | undefined {
    // console.log('reading', fileName);
    if (fileName in files) {
      return files[fileName];
    }
    return undefined;
  };

  host.writeFile = function writeFile(fileName: string, content: string) {
    createdFiles[fileName] = content;
  };

  let program = ts.createProgram(sourceFiles, options, host);

  let emitResult = program.emit();
  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  for (let diagnostic of allDiagnostics) {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  }

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  return createdFiles;
}

console.log(compile(['main.ts'], []));
