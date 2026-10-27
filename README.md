# FinAiMine-UI

> **React 18 + Vite + TypeScript Frontend — AI Stock Dashboard & Copilot**

Part of the [Fin AI Mine](../plan.md) system. A dark-themed, glassmorphic financial terminal featuring real-time stock monitoring, interactive candlestick charts, technical indicators, ML prediction gauges, and a conversational AI copilot.

---

## ✨ Features

- **Executive Market Dashboard:**
  - AI-generated market intelligence brief
  - Real-time stock cards with interactive SVG sparklines
  - Top gainers and pullbacks spotlight
  - Instant ticker and company name search
- **Per-Stock Deep Dive:**
  - High-performance canvas chart (Candlestick & Gradient Area modes)
  - Timeframe toggles (1W, 1M, 3M, 1Y, ALL)
  - Interactive crosshair with full OHLCV readout
  - Overlay toggles for 20-day and 50-day Simple Moving Averages
  - ML price target & confidence meter card
  - Technical indicator matrix (RSI-14, MACD, Bollinger Bands)
  - Key fundamental statistics (P/E, Market Cap, EPS, Margin)
  - News sentiment breakdown
  - Context-injected docked AI stock chat
- **Global AI Copilot:**
  - Full-screen multi-turn financial assistant
  - Prompt suggestion chips for one-click analysis
  - Connected to Delta Lake tables and ML models
  - Standalone offline fallbacks for resilient demonstration

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Default VITE_API_URL is http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠 Tech Stack
- React 18 + TypeScript + Vite
- Lucide React (financial and system icons)
- HTML5 Canvas for fast 60fps charting
- Vanilla CSS with CSS custom property tokens and glassmorphism
