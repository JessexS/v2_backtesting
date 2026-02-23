# Roadmap: v2_backtesting

**Project**: Financial Backtesting Tool  
**Goal**: Visualize synthetic market data, test trading strategies, measure performance

---

## Phase Overview

| Phase              | Goal                                | Status  |
| ------------------ | ----------------------------------- | ------- |
| 01-fix-chart       | Fix broken chart, visualize candles | pending |
| 02-strategy-engine | Add trading strategy signals        | pending |
| 03-metrics         | Calculate performance metrics       | pending |
| 04-data-io         | Export results to CSV/JSON          | pending |

---

## Requirements

- **Requirements:** [CHART-01], [CHART-02], [STRAT-01], [STRAT-02], [STRAT-03], [METRICS-01], [METRICS-02], [METRICS-03], [IO-01]

---

## Phase 01: Fix Chart & Visualize

**Goal:** Fix broken CandleChart component and display candles visually

**Plans:** 1 plan(s)

- [x] 01-fix-chart-01-PLAN.md — Fix chart module and wire into UI

---

## Phase 02: Strategy Engine

**Goal:** Add trading strategy signal generation

**Plans:** 1 plan(s)

- [x] 02-strategy-engine-01-PLAN.md — Implement strategy types and signal generation

---

## Phase 03: Metrics

**Goal:** Calculate and display performance metrics

**Plans:** 1 plan(s)

- [x] 03-metrics-01-PLAN.md — Implement metrics calculation (Sharpe, drawdown, P&L)

---

## Phase 04: Data I/O

**Goal:** Export results to CSV/JSON

**Plans:** 1 plan(s)

- [x] 04-data-io-01-PLAN.md — Add export functionality

---

## Decisions

- [Deferred] Real market data import — Added to backlog (IO-02)
- [Deferred] Backend/API — Keep as SPA for now
