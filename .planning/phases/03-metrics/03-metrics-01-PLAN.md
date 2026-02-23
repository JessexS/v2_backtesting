---
phase: 03-metrics
plan: 01
type: execute
wave: 1
depends_on: [02-strategy-engine-01]
files_modified: []
autonomous: true
requirements: [METRICS-01, METRICS-02, METRICS-03]
---

<objective>
Calculate and display performance metrics for backtested strategies
</objective>

<context>
@src/lib/types.ts
</context>

<tasks>

<task type="auto">
  <name>Add metrics types</name>
  <files>src/lib/types.ts</files>
  <action>
Add to src/lib/types.ts:
- Trade type: { entryTs, entryPrice, exitTs, exitPrice, pnl, position }
- Metrics type: { totalTrades, winningTrades, losingTrades, winRate, totalPnl, avgPnl, sharpeRatio, maxDrawdown, maxDrawdownPct, avgWin, avgLoss }
- BacktestResult extends StrategyResult with: trades[], metrics
  </action>
  <verify>
grep -q "Trade" src/lib/types.ts && grep -q "Metrics" src/lib/types.ts
  </verify>
  <done>types.ts has Trade, Metrics, BacktestResult types</done>
</task>

<task type="auto">
  <name>Implement metrics calculation</name>
<files>src/lib/metrics/calculator.ts</files>
<action>
Create src/lib/metrics/calculator.ts:
- calculateMetrics(candles, signals): Metrics
- generateTrades(candles, signals): Trade[]

Metrics to calculate:

- totalTrades, winningTrades, losingTrades, winRate
- totalPnl, avgPnl, avgWin, avgLoss
- sharpeRatio: (meanReturn / stdReturn) \* sqrt(252) for daily
- maxDrawdown: largest peak-to-trough decline
- maxDrawdownPct: as percentage

Use close price for P&L. Assume $1 per unit, no slippage for now.
</action>
<verify>
ls src/lib/metrics/calculator.ts && npm run build 2>&1 | grep -q "error" || echo "Build passes"
</verify>
<done>Metrics calculator exists and compiles</done>
</task>

<task type="auto">
  <name>Wire metrics into worker</name>
<files>src/workers/sim.worker.ts</files>
<action>
Update sim.worker.ts:
- After generating signals, calculate trades and metrics
- Include in BacktestResult returned to main thread
</action>
<verify>
npm run build 2>&1 | grep -q "error" || echo "Build passes"
  </verify>
  <done>Worker returns full backtest result with metrics</done>
</task>

</tasks>

<verification>
Run simulation, verify metrics appear in output
</verification>

<success_criteria>
Backtest results include trades array and complete metrics
</success_criteria>

<output>
After completion, create .planning/phases/03-metrics/03-metrics-SUMMARY.md
</output>
