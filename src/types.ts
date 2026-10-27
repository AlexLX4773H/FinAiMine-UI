export interface StockQuote {
  ticker: string;
  company_name: string;
  price: number;
  change: number;
  change_pct: number;
  high: number;
  low: number;
  volume: number;
  date: string;
  week_52_high: number;
  week_52_low: number;
  rsi_14: number;
  sma_20: number;
  sma_50: number;
  macd: number;
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20?: number | null;
  sma_50?: number | null;
  bb_upper?: number | null;
  bb_lower?: number | null;
}

export interface PredictionData {
  source?: string;
  ticker?: string;
  current_close?: number;
  predicted_close?: number;
  change_pct?: number;
  expected_change_pct?: number;
  direction?: 'BULLISH' | 'BEARISH' | string;
  confidence?: number;
  confidence_score?: string | number;
  model_version?: string;
  horizon?: string;
  disclaimer?: string;
}

export interface FundamentalsData {
  ticker?: string;
  company_name?: string;
  sector?: string;
  pe_ratio?: number;
  forward_pe?: number;
  market_cap?: number;
  trailing_eps?: number;
  eps?: number;
  revenue?: number;
  net_income?: number;
  profit_margin_pct?: number;
  debt_to_equity?: number;
  dividend_yield?: number;
}

export interface SentimentData {
  ticker?: string;
  avg_sentiment?: number;
  sentiment_label?: string;
  news_count?: number;
  bullish_articles?: number;
  bearish_articles?: number;
  neutral_articles?: number;
  date?: string;
  recent_articles_scored?: number;
}

export interface DashboardSummary {
  status: string;
  market_stats: {
    tracked_count: number;
    market_avg_change_pct: number;
    market_sentiment_score: number;
    sentiment_label: string;
  };
  top_gainers: StockQuote[];
  top_losers: StockQuote[];
  watchlist: StockQuote[];
  ai_summary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tickerContext?: string;
  isStreaming?: boolean;
}
