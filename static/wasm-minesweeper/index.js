import init, { wasm_main } from "./pkg/wasm_minesweeper.js";

async function run() {
  await init();
  wasm_main();
}

run();