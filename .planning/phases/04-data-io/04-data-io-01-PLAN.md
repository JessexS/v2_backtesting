---
phase: 04-data-io
plan: 01
type: execute
wave: 1
depends_on: [03-metrics-01]
files_modified: []
autonomous: true
requirements: [IO-01]
---

<objective>
Add export functionality for backtest results
</objective>

<context>
@src/lib/types.ts
</context>

<tasks>

<task type="auto">
  <name>Add export utilities</name>
  <files>src/lib/export/index.ts</files>
  <action>
Create src/lib/export/index.ts:
- exportToCsv(backtestResult): string
- exportToJson(backtestResult): string
- downloadFile(content: string, filename: string, mimeType: string): void

Export format:

- CSV: candles with signal markers, trades table
- JSON: full backtest result structure

Files to export:

- candles.csv / candles.json
- trades.csv / trades.json
- metrics summary
  </action>
  <verify>
  ls src/lib/export/index.ts && npm run build 2>&1 | grep -q "error" || echo "Build passes"
  </verify>
  <done>Export utilities exist and compile</done>
  </task>

<task type="auto">
  <name>Add export buttons to UI</name>
  <files>src/App.svelte</files>
  <action>
Update App.svelte:
- Import export functions
- Add "Export CSV" and "Export JSON" buttons
- Display after simulation completes
- Show metrics summary in UI as well
</action>
  <verify>
npm run build 2>&1 | grep -q "error" || echo "Build passes"
  </verify>
  <done>Export buttons appear in UI after simulation</done>
</task>

</tasks>

<verification>
Run simulation, click export buttons, verify file downloads
</verification>

<success_criteria>
Backtest results downloadable as CSV and JSON
</success_criteria>

<output>
After completion, create .planning/phases/04-data-io/04-data-io-SUMMARY.md
</output>
