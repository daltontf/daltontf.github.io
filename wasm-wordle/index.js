import init, { wasm_main } from "./pkg/wasm_wordle.js";

async function run() {
  await init();
  wasm_main();
}

run();