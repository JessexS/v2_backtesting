---
phase: 01-fix-chart
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: [CHART-01, CHART-02]
---

<objective>
Fix broken CandleChart component and display candles visually
</objective>

<context>
@src/lib/types.ts
@src/components/CandleChart.svelte
</context>

<tasks>

<task type="auto">
  <name>Implement chart module</name>
  <files>src/lib/chart/Chart.ts</files>
  <action>
Create src/lib/chart/Chart.ts with:
- createCandleChart(host: HTMLDivElement): ChartController
- ChartController interface: setCandles(candles), updateLast(candle), resize(), destroy()
- Use HTML5 Canvas for rendering candlesticks
- Support auto-scale Y-axis based on price range
- Draw green candles for up, red for down
- Show price axis on right, time axis on bottom
- Handle window resize

Do NOT use external charting libraries (keep it lightweight).
</action>
<verify>
npm run build 2>&1 | grep -q "error" || echo "Build passes"
ls src/lib/chart/Chart.ts
</verify>
<done>Chart.ts module exists with createCandleChart export</done>
</task>

</tasks>

<verification>
Run dev server, check console for import errors
</verification>

<success_criteria>
CandleChart component renders without import errors
</success_criteria>

<output>
After completion, create .planning/phases/01-fix-chart/01-fix-chart-SUMMARY.md
</output>
