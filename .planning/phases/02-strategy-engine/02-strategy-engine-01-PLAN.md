---
phase: 02-strategy-engine
plan: 01
type: execute
wave: 1
depends_on: [01-fix-chart-01]
files_modified: []
autonomous: true
requirements: [STRAT-01, STRAT-02, STRAT-03]
---

<objective>
Add trading strategy signal generation to backtester
</objective>

<context>
@src/lib/types.ts
@src/workers/sim.worker.ts
</context>

<tasks>

<task type="auto">
  <name>Add strategy types and position enum</name>
  <files>src/lib/types.ts</files>
  <action>
Add to src/lib/types.ts:
- Position enum: { flat, long, short }
- Signal type: { tsMs, position, price, reason }
- StrategyResult type: { signals: Signal[], candles: Candle[] }
- StrategyConfig type with strategy field

Add StrategyType: "sma-crossover" | "mean-reversion" | "momentum"

Reference: SMA crossover uses short MA crossing long MA
</action>
<verify>
grep -q "Position" src/lib/types.ts && grep -q "Signal" src/lib/types.ts
</verify>
<done>types.ts has Position, Signal, StrategyResult, StrategyConfig</done>
</task>

<task type="auto">
  <name>Implement signal generation</name>
  <files>src/lib/strategies/signals.ts</files>
  <action>
Create src/lib/strategies/signals.ts:
- smaCrossover(candles, shortPeriod, longPeriod): Signal[]
- meanReversion(candles, period, threshold): Signal[]
- momentum(candles, period, threshold): Signal[]

Each returns Signal[] with buy (long) / sell (short) signals.

Use close price for calculations. Generate signals only after warmup period (enough candles for MA).
</action>
<verify>
ls src/lib/strategies/signals.ts && npm run build 2>&1 | grep -q "error" || echo "Build passes"
</verify>
<done>Signal generation functions exist and compile</done>
</task>

<task type="auto">
  <name>Wire strategy into worker</name>
  <files>src/workers/sim.worker.ts</files>
  <action>
Update sim.worker.ts:
- Add strategy field to SimulationParams
- After generating candles, run selected strategy
- Return signals in SimulationResult

Handle strategies: sma-crossover (default), mean-reversion, momentum
</action>
<verify>
npm run build 2>&1 | grep -q "error" || echo "Build passes"
</verify>
<done>Worker returns signals with simulation results</done>
</task>

</tasks>

<verification>
Run simulation, verify signals appear in output
</verification>

<success_criteria>
Strategy signals generated and returned in simulation result
</success_criteria>

<output>
After completion, create .planning/phases/02-strategy-engine/02-strategy-engine-SUMMARY.md
</output>
