// this file demonstrates how to use eval-z3 from node

import { evalZ3 } from './eval-z3';
import { init } from 'z3-solver';
// @ts-ignore we're not going to bother with typedefs for this
import * as TS_LIBS from '../ts-libs';

// this needs to be defined for compileZ3JS to work
Object.defineProperty(globalThis, 'TS_LIBS', { value: TS_LIBS });

(async () => {
  let Z3 = await init();
  console.log(await evalZ3(Z3, `
      const x = Z3.Int.const('x');

      const solver = new Z3.Solver();
      solver.add(Z3.And(x.ge(0), x.le(9)));
      await solver.check();
  `));
})();
