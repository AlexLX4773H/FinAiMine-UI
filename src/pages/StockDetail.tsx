import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Bot, ShieldAlert, BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import { CandleData, StockQuote, PredictionData, FundamentalsData, SentimentData } from '../types';
import { fetchStockDetail, fetchStockHistory } from '../services/api';
import { StockChart } from '../components/StockChart';
import { Chat } from '../components/Chat';

interface StockDetailProps {
  ticker: string;
  onBack: () => void;
}

export const StockDetail: React.FC<StockDetailProps> = ({ ticker, onBack }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [fundamentals, setFundamentals] = useState<FundamentalsData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [history, setHistory] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const [detail, hist] = await Promise.all([
          fetchStockDetail(ticker),
          fetchStockHistory(ticker, '3mo'),
        ]);
        if (isMounted) {
          setQuote(detail.quote);
          setPrediction(detail.prediction);
          setFundamentals(detail.fundamentals);
          setSentiment(detail.sentiment);
          setHistory(hist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (loading || !quote) {
    return (
      <div className="content-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Loading deep-dive analytics for {ticker}...</span>
      </div>
    );
  }

  const isPositive = quote.change_pct >= 0;
  const predClose = prediction?.predicted_close || quote.price * 1.015;
  const predConfidence = prediction?.confidence || 82.5;

  return (
    <div className="content-container">
      {/* Top Navigation & Stock Header */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '6px 0',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="stock-detail-header">
        <div className="stock-headline">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>{quote.ticker}</h2>
              <div className={`price-pill ${isPositive ? 'bullish' : 'bearish'}`}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{isPositive ? `+${quote.change_pct}%` : `${quote.change_pct}%`}</span>
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
              {quote.company_name}
            </div>
          </div>
        </div>

        <div className="detail-price-box">
          <div className="big-price">${quote.price.toFixed(2)}</div>
          <span style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '1.1rem', fontWeight: 600 }}>
            {isPositive ? `+$${quote.change.toFixed(2)}` : `-$${Math.abs(quote.change).toFixed(2)}`} Today
          </span>
        </div>
      </div>

      {/* Main Detail Grid Layout */}
      <div className="detail-grid">
        {/* Left Column: Interactive Chart + Docked AI Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Chart */}
          <StockChart data={history} ticker={quote.ticker} />

          {/* Docked Contextual AI Chat */}
          <div style={{ height: '440px' }}>
            <Chat
              tickerContext={quote.ticker}
              stockSnapshot={{
                company_name: quote.company_name,
                latest_close: quote.price,
                change_pct: quote.change_pct,
                week_52_low: quote.week_52_low,
                week_52_high: quote.week_52_high,
                sentiment_score: sentiment?.avg_sentiment || 0.25,
                predicted_close: predClose,
                confidence: predConfidence,
              }}
            />
          </div>
        </div>

        {/* Right Column: Prediction + Technicals + Fundamentals + Sentiment */}
        <div className="side-panel">
          {/* ML Prediction Card */}
          <div className="prediction-card">
            <div className="pred-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} color="#c4b5fd" />
                <span style={{ fontWeight: 600, color: '#fff' }}>ML Price Forecast</span>
              </div>
              <span className="pred-badge">{prediction?.horizon || '1-Day'}</span>
            </div>

            <div className="pred-values">
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Price</div>
                <div className="pred-target">${predClose.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bias</div>
                <div
                  style={{
                    color: prediction?.direction === 'BULLISH' ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                  }}
                >
                  {prediction?.direction || 'BULLISH'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Model Confidence</span>
                <strong style={{ color: '#fff' }}>{predConfidence}%</strong>
              </div>
              <div className="confidence-bar-bg">
                <div className="confidence-bar-fill" style={{ width: `${predConfidence}%` }}></div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.4 }}>
              <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Trained on Delta Lake technical feature vectors using Gradient Boosting.
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BarChart2 size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontWeight: 600 }}>Technical Indicators</h4>
            </div>

            <div className="indicators-grid">
              <div className="indicator-item">
                <div className="indicator-name">RSI (14)</div>
                <div className="indicator-val" style={{ color: quote.rsi_14 > 70 ? 'var(--accent-red)' : quote.rsi_14 < 30 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                  {quote.rsi_14}
                </div>
              </div>

              <div className="indicator-item">
                <div className="indicator-name">MACD (12,26,9)</div>
                <div className="indicator-val" style={{ color: quote.macd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {quote.macd}
                </div>
              </div>

              <div className="indicator-item">
                <div className="indicator-name">SMA (20)</div>
                <div className="indicator-val">${quote.sma_20.toFixed(2)}</div>
              </div>

              <div className="indicator-item">
                <div className="indicator-name">SMA (50)</div>
                <div className="indicator-val">${quote.sma_50.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Company Fundamentals */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <DollarSign size={18} color="#10b981" />
              <h4 style={{ fontWeight: 600 }}>Key Fundamentals</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>P/E Ratio (TTM)</span>
                <strong>{fundamentals?.pe_ratio ? fundamentals.pe_ratio.toFixed(1) : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Market Cap</span>
                <strong>${fundamentals?.market_cap ? (fundamentals.market_cap / 1e12).toFixed(2) + 'T' : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trailing EPS</span>
                <strong>${fundamentals?.trailing_eps ? fundamentals.trailing_eps.toFixed(2) : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Profit Margin</span>
                <strong>{fundamentals?.profit_margin_pct ? `${fundamentals.profit_margin_pct.toFixed(1)}%` : 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* News Sentiment Breakdown */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingUp size={18} color="#a855f7" />
              <h4 style={{ fontWeight: 600 }}>News Sentiment Trend</h4>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Mood:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {sentiment?.sentiment_label || 'Bullish'} ({(sentiment?.avg_sentiment || 0.28).toFixed(2)})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{sentiment?.bullish_articles || 8}</div>
                <div style={{ color: 'var(--text-muted)' }}>Bullish</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#fff', fontWeight: 700 }}>{sentiment?.neutral_articles || 3}</div>
                <div style={{ color: 'var(--text-muted)' }}>Neutral</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(244, 63, 94, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <div style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{sentiment?.bearish_articles || 1}</div>
                <div style={{ color: 'var(--text-muted)' }}>Bearish</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
