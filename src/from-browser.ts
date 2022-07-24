// this file demonstrates how to use eval-z3 from a browser
// you must seperately load z3-built.js and coi-serviceworker.js in your html page

import type { evalZ3JS } from './eval-z3';
import { init } from 'z3-solver';

let evalZ3JSPromise: null | Promise<typeof evalZ3JS> = null;
async function loadEvalZ3() {
  // typescript is several megabytes of JS
  // so don't load it until someone actually calls it
  if (evalZ3JSPromise != null) {
    return evalZ3JSPromise;
  }
  evalZ3JSPromise = new Promise((res, rej) => {
    let script = document.createElement('script');
    script.src = 'eval-z3.js';
    script.onload = () => {
      // @ts-ignore eval-z3.js adds this binding to the global
      // the name is defined in build.js
      res(window.evalZ3Mod.evalZ3JS);
    };
    script.onerror = rej;
    document.head.appendChild(script);
  });
  return evalZ3JSPromise;
}

let Z3Promise: null | ReturnType<typeof init>;
async function loadZ3() {
  if (Z3Promise != null) {
    return Z3Promise;
  }
  Z3Promise = init();
  return Z3Promise;
}

window.addEventListener('load', () => {
  let inp = document.querySelector('#in')! as HTMLTextAreaElement;
  let out = document.querySelector('#out')! as HTMLTextAreaElement;
  document.querySelector('#go')!.addEventListener('click', async () => {
    out.value = 'Working...';
    try {
      let Z3 = await loadZ3();
      let evalZ3JS = await loadEvalZ3();
      out.value = await evalZ3JS(Z3, inp.value);
    } catch (e) {
      out.value = 'Error: ' + (e as Error).message;
    }
  });
});
