<script lang="ts">
  import type { SimulationParams, SimulationResult, Candle } from "./lib/types";

  let error: string | null = null;
  let running = false;

  // Simulation params
  let seed = 42;
  let startPrice = 100;
  let meanPrice = 100;
  let meanReversionTheta = 0.8;
  let volatilitySigma = 0.25;
  let jumpLambdaPerSec = 0.03;
  let jumpStd = 0.08;
  let baseVolume = 1.0;
  let volumeVol = 0.35;

  let dtMs = 250;
  let candleMs = 60_000;
  let ticks = 20_000;

  let candles: Candle[] = [];
  let last: Candle | null = null;

  const worker = new Worker(new URL("./workers/sim.worker.ts", import.meta.url), { type: "module" });

  worker.onmessage = (ev: MessageEvent<any>) => {
    const msg = ev.data;

    if (msg?.type === "error") {
      error = msg.message ?? "Unknown worker error";
      running = false;
      return;
    }

    if (msg?.type === "simulationResult") {
      const result = msg.result as SimulationResult;
      candles = result.candles;
      last = candles.length ? candles[candles.length - 1] : null;
      running = false;
      return;
    }
  };

  function run() {
    error = null;
    running = true;
    candles = [];
    last = null;

    const params: SimulationParams = {
      seed,
      startTsMs: Date.now(),
      dtMs,
      startPrice,
      meanPrice,
      meanReversionTheta,
      volatilitySigma,
      jumpLambdaPerSec,
      jumpStd,
      baseVolume,
      volumeVol,
      candleMs,
      ticks
    };

    worker.postMessage({ type: "runSimulation", params });
  }

  function fmt(n: number) {
    return Number.isFinite(n) ? n.toFixed(4) : "NaN";
  }
</script>

<style>
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px;
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 16px;
  }
  .card {
    background: #0f1620;
    border: 1px solid #1f2a37;
    border-radius: 12px;
    padding: 12px;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 140px;
    gap: 8px;
    align-items: center;
    margin: 6px 0;
  }
  label {
    color: #c9d1d9;
    font-size: 14px;
  }
  input {
    width: 100%;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid #263241;
    background: #0b0f14;
    color: #e6edf3;
  }
  button {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #2b3b52;
    background: #142033;
    color: #e6edf3;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .error {
    border: 1px solid #6b1d1d;
    background: #2a0f0f;
    padding: 10px;
    border-radius: 10px;
    color: #ffd7d7;
    margin-top: 8px;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
      monospace;
    font-size: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  td,
  th {
    border-bottom: 1px solid #1f2a37;
    padding: 6px 8px;
    text-align: left;
  }
</style>

<div class="wrap">
  <div class="card">
    <h2>Simulation settings</h2>

    <div class="row"><label>Seed</label><input type="number" bind:value={seed} /></div>
    <div class="row"><label>Start price</label><input type="number" bind:value={startPrice} /></div>
    <div class="row"><label>Mean price</label><input type="number" bind:value={meanPrice} /></div>
    <div class="row"><label>Mean reversion θ</label><input type="number" step="0.05" bind:value={meanReversionTheta} /></div>
    <div class="row"><label>Volatility σ</label><input type="number" step="0.01" bind:value={volatilitySigma} /></div>
    <div class="row"><label>Jump λ (per sec)</label><input type="number" step="0.01" bind:value={jumpLambdaPerSec} /></div>
    <div class="row"><label>Jump std</label><input type="number" step="0.01" bind:value={jumpStd} /></div>
    <div class="row"><label>Base volume</label><input type="number" step="0.1" bind:value={baseVolume} /></div>
    <div class="row"><label>Volume vol</label><input type="number" step="0.05" bind:value={volumeVol} /></div>

    <hr style="border:0;border-top:1px solid #1f2a37;margin:10px 0;" />

    <div class="row"><label>Tick dt (ms)</label><input type="number" bind:value={dtMs} /></div>
    <div class="row"><label>Candle (ms)</label><input type="number" bind:value={candleMs} /></div>
    <div class="row"><label>Ticks</label><input type="number" bind:value={ticks} /></div>

    <button on:click={run} disabled={running}>
      {running ? "Running…" : "Run simulation"}
    </button>

    {#if error}
      <div class="error mono">{error}</div>
    {/if}
  </div>

  <div class="card">
    <h2>Output</h2>

    <div class="mono">
      Candles: {candles.length}
      {#if last}
        <div>Last: O {fmt(last.open)} H {fmt(last.high)} L {fmt(last.low)} C {fmt(last.close)} V {fmt(last.volume)}</div>
      {/if}
    </div>

    <h3>First 20 candles</h3>
    <table class="mono">
      <thead>
        <tr>
          <th>ts</th><th>O</th><th>H</th><th>L</th><th>C</th><th>V</th>
        </tr>
      </thead>
      <tbody>
        {#each candles.slice(0, 20) as c}
          <tr>
            <td>{c.tsMs}</td>
            <td>{fmt(c.open)}</td>
            <td>{fmt(c.high)}</td>
            <td>{fmt(c.low)}</td>
            <td>{fmt(c.close)}</td>
            <td>{fmt(c.volume)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
