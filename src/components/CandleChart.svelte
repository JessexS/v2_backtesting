<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Candle } from "../lib/types";
  import { createCandleChart, type ChartController } from "../lib/chart/Chart";

  export let candles: Candle[] = [];

  let host: HTMLDivElement | null = null;
  let chart: ChartController | null = null;
  let lastLen = 0;

  onMount(() => {
    if (!host) return;
    chart = createCandleChart(host);

    if (candles.length) {
      chart.setCandles(candles);
      lastLen = candles.length;
    }

    const ro = new ResizeObserver(() => {
      chart?.resize();
    });
    ro.observe(host);

    onDestroy(() => ro.disconnect());
  });

  $: if (chart) {
    if (candles.length === 0) {
      // nothing
    } else if (candles.length !== lastLen) {
      chart.setCandles(candles);
      lastLen = candles.length;
    } else {
      // same length -> update last candle
      chart.updateLast(candles[candles.length - 1]);
    }
  }

  onDestroy(() => chart?.destroy());
</script>

<style>
  .chart {
    width: 100%;
    height: 520px;
    border: 1px solid #1f2a37;
    border-radius: 12px;
    overflow: hidden;
    background: #0b0f14;
  }
</style>

<div class="chart" bind:this={host} />