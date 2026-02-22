// worker.ts - Web Worker for heavy computations
/// <reference lib="webworker" />

// If using TypeScript, the above reference is needed for Worker global types.

// **Optionally** import WASM module if available (placeholder example):
// import wasmModule from './monte_carlo_wasm.wasm'; 
// (You'll need a bundler that supports importing .wasm, or load via fetch in runtime)

// Monte Carlo simulation function (JS implementation).
function monteCarloSimulation(S: number, K: number, r: number, sigma: number, T: number, paths: number): number {
  // This simulates an option payoff (European call option as example) using Monte Carlo.
  // If your strategy is different, replace this logic with your own simulation.
  let sumPayoffs = 0;
  for (let i = 0; i < paths; i++) {
    const rand = randomNormal();  // generate a random N(0,1)
    const ST = S * Math.exp((r - 0.5 * sigma * sigma) * T + sigma * Math.sqrt(T) * rand);
    const payoff = Math.max(ST - K, 0);  // payoff for call option (max(ST-K, 0))
    sumPayoffs += payoff;
  }
  // return present value of average payoff
  const optionPrice = Math.exp(-r * T) * (sumPayoffs / paths);
  return optionPrice;
}

// Helper: generate a standard normal random variable (Box-Muller transform)
function randomNormal(): number {
  let u = 0, v = 0;
  // Prevent 0 for log
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z;
}

// **Optional**: If using WebAssembly for Monte Carlo, you might have a function like:
// const wasm = await WebAssembly.instantiate(wasmModule);
// const monteCarloWasm = wasm.instance.exports.monte_carlo_call as CallableFunction;
// (In a worker, you could load the .wasm by fetch as well if not using import syntax.)
//
// Then you could call `monteCarloWasm(S, K, r, sigma, T, paths)` to get the result instead of JS loop above.
// The choice of using JS vs WASM can be toggled based on availability or size of simulation.

// Listener for messages from main thread
self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'runSimulation') {
    // Unpack parameters
    const { S, K, r, sigma, T, paths } = data.params;
    // Run the Monte Carlo simulation (either via JS or WASM)
    let resultValue: number;
    try {
      // If WASM is integrated, call the WASM function here.
      resultValue = monteCarloSimulation(S, K, r, sigma, T, paths);
      // e.g., if using WASM: resultValue = monteCarloWasm(S, K, r, sigma, T, paths);
    } catch (e) {
      console.error("Simulation error:", e);
      resultValue = NaN;
    }
    // Post result back to main thread
    postMessage({ type: 'simulationResult', value: resultValue });
  }

  else if (data.type === 'runOptimization') {
    // Unpack parameters and range of test values
    const { S, r, sigma, T, paths } = data.params;
    const testValues: number[] = data.testValues;
    const optimizeParam: string = data.optimizeParam;  // e.g., 'K' meaning we vary K
    
    let bestParam: number | null = null;
    let bestMetric: number = -Infinity;

    for (const val of testValues) {
      let outcome: number;
      try {
        if (optimizeParam === 'K') {
          // If optimizing strike price, vary K
          outcome = monteCarloSimulation(S, val, r, sigma, T, paths);
        } else {
          // Add other parameter optimization cases if needed
          // For example, if optimizing something else, call simulation accordingly.
          outcome = monteCarloSimulation(S, val, r, sigma, T, paths);
        }
      } catch(e) {
        console.error("Error in simulation for param", val, e);
        outcome = NaN;
      }
      // In this example, let's assume we want to MAXIMIZE the result (e.g., maximize option price or profit)
      // Depending on your goal, you might minimize error or target a specific value.
      if (!isNaN(outcome) && outcome > bestMetric) {
        bestMetric = outcome;
        bestParam = val;
      }
    }

    // Send back the best parameter found and its outcome
    postMessage({ type: 'optimizationResult', bestParam: bestParam, bestValue: bestMetric });
  }
};
