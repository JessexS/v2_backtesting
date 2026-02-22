export type SimulationParams = {
  seed: number;
  startTsMs: number;
  dtMs: number;

  // price process
  startPrice: number;
  meanPrice: number;
  meanReversionTheta: number; // strength
  volatilitySigma: number; // diffusion
  jumpLambdaPerSec: number; // jump frequency (Poisson intensity)
  jumpStd: number; // jump size std (log-return)

  // volume model
  baseVolume: number;
  volumeVol: number;

  // candle config
  candleMs: number;
  ticks: number;
};

export type Tick = {
  tsMs: number;
  price: number;
  volume: number;
};

export type Candle = {
  tsMs: number; // candle open timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type SimulationResult = {
  candles: Candle[];
};
