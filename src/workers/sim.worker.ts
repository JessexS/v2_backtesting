/// <reference lib="webworker" />
import type { Candle, SimulationParams, SimulationResult, Tick } from "../lib/types";
import { XorShift32 } from "../lib/math/rng";

type WorkerRequest =
  | { type: "runSimulation"; params: SimulationParams }
  | { type: "ping" };

type WorkerResponse =
  | { type: "pong" }
  | { type: "simulationResult"; result: SimulationResult }
  | { type: "error"; message: string };

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function validateParams(p: SimulationParams): string | null {
  const checks: Array<[boolean, string]> = [
    [isFiniteNumber(p.seed), "seed invalid"],
    [isFiniteNumber(p.startTsMs), "startTsMs invalid"],
    [isFiniteNumber(p.dtMs) && p.dtMs > 0, "dtMs invalid"],
    [isFiniteNumber(p.startPrice) && p.startPrice > 0, "startPrice invalid"],
    [isFiniteNumber(p.meanPrice) && p.meanPrice > 0, "meanPrice invalid"],
    [isFiniteNumber(p.meanReversionTheta) && p.meanReversionTheta >= 0, "theta invalid"],
    [isFiniteNumber(p.volatilitySigma) && p.volatilitySigma >= 0, "sigma invalid"],
    [isFiniteNumber(p.jumpLambdaPerSec) && p.jumpLambdaPerSec >= 0, "lambda invalid"],
    [isFiniteNumber(p.jumpStd) && p.jumpStd >= 0, "jumpStd invalid"],
    [isFiniteNumber(p.baseVolume) && p.baseVolume >= 0, "baseVolume invalid"],
    [isFiniteNumber(p.volumeVol) && p.volumeVol >= 0, "volumeVol invalid"],
    [isFiniteNumber(p.candleMs) && p.candleMs > 0, "candleMs invalid"],
    [isFiniteNumber(p.ticks) && p.ticks > 0, "ticks invalid"]
  ];
  for (const [ok, msg] of checks) if (!ok) return msg;
  if (p.candleMs % p.dtMs !== 0) return "candleMs must be divisible by dtMs for clean aggregation";
  return null;
}

function candleSlot(tsMs: number, candleMs: number): number {
  return Math.floor(tsMs / candleMs) * candleMs;
}

function simulateTicks(params: SimulationParams): Tick[] {
  const rng = new XorShift32(params.seed);

  const dtSec = params.dtMs / 1000;
  let ts = params.startTsMs;

  // Mallinnetaan log-price, jotta positiivisuus säilyy
  let logP = Math.log(params.startPrice);
  const logMean = Math.log(params.meanPrice);

  const ticks: Tick[] = [];
  for (let i = 0; i < params.ticks; i++) {
    // OU-tyylinen drift log-tilassa: dX = theta*(mu - X)dt + sigma*dW + jumps
    const z = rng.nextNormal();
    const dW = Math.sqrt(dtSec) * z;
    const meanRevert = params.meanReversionTheta * (logMean - logP) * dtSec;
    const diffusion = params.volatilitySigma * dW;

    // Jump approx: Bernoulli(p=lambda*dt), jos dt pieni
    const jumpProb = params.jumpLambdaPerSec * dtSec;
    const doJump = rng.nextFloat01() < jumpProb;
    const jump = doJump ? rng.nextNormal() * params.jumpStd : 0;

    logP = logP + meanRevert + diffusion + jump;
    const price = Math.exp(logP);

    // Volume: perus + riippuvuus liikkeen koosta + satunnaisuus
    // Käytetään |return| signaalina aktiviteetille
    const absMove = Math.abs(meanRevert + diffusion + jump);
    const volNoise = Math.max(0, 1 + rng.nextNormal() * params.volumeVol);
    const volume = params.baseVolume * (1 + 10 * absMove) * volNoise;

    ticks.push({ tsMs: ts, price, volume });

    ts += params.dtMs;
  }
  return ticks;
}

function ticksToCandles(ticks: Tick[], candleMs: number): Candle[] {
  const out: Candle[] = [];
  let cur: Candle | null = null;

  for (const t of ticks) {
    const slot = candleSlot(t.tsMs, candleMs);

    if (!cur || cur.tsMs !== slot) {
      if (cur) out.push(cur);
      cur = {
        tsMs: slot,
        open: t.price,
        high: t.price,
        low: t.price,
        close: t.price,
        volume: t.volume
      };
      continue;
    }

    cur.high = Math.max(cur.high, t.price);
    cur.low = Math.min(cur.low, t.price);
    cur.close = t.price;
    cur.volume += t.volume;
  }

  if (cur) out.push(cur);
  return out;
}

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  try {
    const msg = ev.data;
    if (msg.type === "ping") {
      const resp: WorkerResponse = { type: "pong" };
      self.postMessage(resp);
      return;
    }

    if (msg.type === "runSimulation") {
      const err = validateParams(msg.params);
      if (err) {
        const resp: WorkerResponse = { type: "error", message: err };
        self.postMessage(resp);
        return;
      }

      const ticks = simulateTicks(msg.params);
      const candles = ticksToCandles(ticks, msg.params.candleMs);

      const resp: WorkerResponse = { type: "simulationResult", result: { candles } };
      self.postMessage(resp);
      return;
    }
  } catch (e) {
    const resp: WorkerResponse = {
      type: "error",
      message: e instanceof Error ? e.message : String(e)
    };
    self.postMessage(resp);
  }
};
