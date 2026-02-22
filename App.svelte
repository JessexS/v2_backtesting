<script lang="ts">
  // Import types if needed (not strictly necessary for simple use)
  // no imports since we'll communicate with worker via postMessage

  let spotPrice: number = 100;       // S (initial price, e.g. $100)
  let strikePrice: number = 100;     // K (strike price for option or some target)
  let riskFreeRate: number = 0.02;   // r (risk-free rate, 2%)
  let volatility: number = 0.2;      // σ (volatility, 20%)
  let timeHorizon: number = 1;       // T (time in years)
  let numPaths: number = 10000;      // M (number of Monte Carlo simulations)

  let simulationResult: string | null = null;
  let optimizationResult: string | null = null;

  // Initialize the Web Worker (make sure `worker.js` is included in public/build or accessible path)
  // If using Vite, you might do: new Worker(new URL('./worker.ts', import.meta.url))
  const worker = new Worker('/worker.js');  // Path may differ based on build; adjust accordingly

  // Listen for messages from the worker
  worker.onmessage = (event: MessageEvent) => {
    const data = event.data;
    if (data.type === 'simulationResult') {
      // Received result from Monte Carlo simulation
      simulationResult = `Estimated Outcome: ${data.value}`;
    } else if (data.type === 'optimizationResult') {
      // Received result from parameter optimization
      optimizationResult = `Optimal Parameter = ${data.bestParam}, Outcome = ${data.bestValue}`;
    }
  };

  // Function to send simulation request to worker
  function runSimulation() {
    simulationResult = "Running simulation...";      // update UI immediately
    optimizationResult = null;                       // clear any old optimization result
    // Post a message to worker with all parameters for simulation
    worker.postMessage({
      type: 'runSimulation',
      params: {
        S: spotPrice,
        K: strikePrice,
        r: riskFreeRate,
        sigma: volatility,
        T: timeHorizon,
        paths: numPaths
      }
    });
  }

  // Function to send optimization request to worker
  function runOptimization() {
    optimizationResult = "Running optimization...";  // immediate UI feedback
    simulationResult = null;
    // Here we define a range of values to optimize over. For example, let's say
    // we want to find the best strikePrice (K) that maximizes outcome (just as an illustration).
    // We will try a range around the current strikePrice.
    const testValues = [];
    for (let k = Math.max(1, strikePrice - 20); k <= strikePrice + 20; k += 5) {
      testValues.push(k);
    }
    worker.postMessage({
      type: 'runOptimization',
      params: {
        S: spotPrice,
        r: riskFreeRate,
        sigma: volatility,
        T: timeHorizon,
        paths: numPaths
      },
      testValues: testValues,
      optimizeParam: 'K'  // indicating we're optimizing the strikePrice in this example
    });
  }
</script>

<style>
  /* Basic styling for form */
  .container {
    max-width: 600px;
    margin: auto;
    font-family: Arial, sans-serif;
    padding: 1em;
  }
  fieldset {
    border: 1px solid #ccc;
    padding: 1em;
  }
  legend {
    font-weight: bold;
  }
  .field {
    margin: 0.5em 0;
  }
  label {
    display: inline-block;
    width: 150px;
  }
  input {
    width: 100px;
  }
  button {
    margin: 1em 0.5em 0 0;
    padding: 0.5em 1em;
  }
  .result {
    margin-top: 1em;
    padding: 0.5em;
    background: #f9f9f9;
    border: 1px solid #ddd;
  }
</style>

<div class="container">
  <h1>Strategy Simulator</h1>
  <p>Use the form below to set simulation parameters and run the Monte Carlo simulation or optimize a parameter.</p>
  
  <fieldset>
    <legend>Simulation Parameters</legend>
    <div class="field">
      <label for="spot">Spot Price (S):</label>
      <input id="spot" type="number" bind:value={spotPrice} />
    </div>
    <div class="field">
      <label for="strike">Strike/Target (K):</label>
      <input id="strike" type="number" bind:value={strikePrice} />
    </div>
    <div class="field">
      <label for="rate">Risk-Free Rate (r):</label>
      <input id="rate" type="number" step="0.01" bind:value={riskFreeRate} />
    </div>
    <div class="field">
      <label for="vol">Volatility (σ):</label>
      <input id="vol" type="number" step="0.01" bind:value={volatility} />
    </div>
    <div class="field">
      <label for="time">Time Horizon (T, years):</label>
      <input id="time" type="number" step="0.1" bind:value={timeHorizon} />
    </div>
    <div class="field">
      <label for="paths"># Paths (M):</label>
      <input id="paths" type="number" bind:value={numPaths} />
    </div>
  </fieldset>
  
  <button on:click={runSimulation}>Run Monte Carlo Simulation</button>
  <button on:click={runOptimization}>Optimize Parameter</button>
  
  {#if simulationResult}
    <div class="result">{simulationResult}</div>
  {/if}
  {#if optimizationResult}
    <div class="result">{optimizationResult}</div>
  {/if}
</div>
