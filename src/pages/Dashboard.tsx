import React, { useState, useEffect } from 'react';
import { DashboardSummary, StockQuote } from '../types';
import { fetchDashboard } from '../services/api';
import { StockCard } from '../components/StockCard';
import { Sparkles, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onSelectStock: (ticker: string) => void;
  searchQuery: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectStock, searchQuery }) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchDashboard();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter stocks by search
  const filteredStocks = React.useMemo(() => {
    if (!data?.watchlist) return [];
    if (!searchQuery.trim()) return data.watchlist;
    const q = searchQuery.toLowerCase();
    return data.watchlist.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.company_name.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '12px' }}>
        <RefreshCw className="spin" size={24} color="var(--accent-cyan)" />
        <span style={{ color: 'var(--text-secondary)' }}>Loading Medallion market intelligence...</span>
      </div>
    );
  }

  const stats = data?.market_stats;

  return (
    <div className="content-container">
      {/* Market Intelligence Banner */}
      <div className="market-banner">
        <div className="banner-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#38bdf8" />
            <h2 className="banner-title">AI Market Intelligence Brief</h2>
          </div>
          <button
            onClick={loadData}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <p className="banner-desc">{data?.ai_summary}</p>

        {/* Market Stats Counters */}
        <div className="market-stats-row">
          <div className="stat-box">
            <div className="stat-label">Market Avg Change</div>
            <div
              className="stat-val"
              style={{ color: (stats?.market_avg_change_pct || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {(stats?.market_avg_change_pct || 0) >= 0 ? `+${stats?.market_avg_change_pct}%` : `${stats?.market_avg_change_pct}%`}
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Market Sentiment</div>
            <div className="stat-val" style={{ color: 'var(--accent-cyan)' }}>
              {stats?.sentiment_label || 'Bullish'} ({stats?.market_sentiment_score || 0.28})
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Tracked Tickers</div>
            <div className="stat-val">{stats?.tracked_count || 8} Active</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Lake Storage</div>
            <div className="stat-val" style={{ fontSize: '1rem', color: '#c4b5fd' }}>
              Delta Lake (Bronze → Gold)
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers Spotlight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Gainers */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-green)' }}>
            <TrendingUp size={18} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Top Gainers Today</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.top_gainers.map((stock) => (
              <div
                key={stock.ticker}
                onClick={() => onSelectStock(stock.ticker)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(13, 21, 39, 0.4)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>{stock.ticker}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>${stock.price.toFixed(2)}</span>
                </div>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.9rem' }}>
                  +{stock.change_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-red)' }}>
            <TrendingDown size={18} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Top Pullbacks Today</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.top_losers.map((stock) => (
              <div
                key={stock.ticker}
                onClick={() => onSelectStock(stock.ticker)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(13, 21, 39, 0.4)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>{stock.ticker}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>${stock.price.toFixed(2)}</span>
                </div>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {stock.change_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist Grid */}
      <div className="section-header">
        <h3 className="section-title">
          <Activity size={20} color="var(--accent-cyan)" />
          <span>Tracked Stock Watchlist</span>
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filteredStocks.length} assets
        </span>
      </div>

      <div className="stocks-grid">
        {filteredStocks.map((stock) => (
          <StockCard key={stock.ticker} stock={stock} onSelect={onSelectStock} />
        ))}
      </div>
    </div>
  );
};
