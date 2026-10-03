import init, { wasm_main } from "./pkg/wasm_sudoku.js";

async function run() {
  await init();
  wasm_main();
}

run();