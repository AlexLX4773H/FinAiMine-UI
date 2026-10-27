import React from 'react';
import { StockQuote } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockCardProps {
  stock: StockQuote;
  onSelect: (ticker: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onSelect }) => {
  const isPositive = stock.change_pct >= 0;

  // Generate lightweight SVG sparkline points
  const sparkPoints = React.useMemo(() => {
    const points: number[] = [];
    let p = stock.price * 0.96;
    for (let i = 0; i < 12; i++) {
      p += (Math.random() - 0.48) * (stock.price * 0.012);
      points.push(p);
    }
    points.push(stock.price);

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 280;
    const height = 45;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [stock.ticker, stock.price]);

  return (
    <div className="glass-card stock-card" onClick={() => onSelect(stock.ticker)}>
      <div>
        {/* Top Header */}
        <div className="stock-card-top">
          <div>
            <div className="stock-sym">{stock.ticker}</div>
            <div className="stock-name" title={stock.company_name}>
              {stock.company_name}
            </div>
          </div>
          <div className={`price-pill ${isPositive ? 'bullish' : 'bearish'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{isPositive ? `+${stock.change_pct}%` : `${stock.change_pct}%`}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="stock-card-price">
          <div className="current-price">${stock.price.toFixed(2)}</div>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="stock-card-sparkline">
          <svg viewBox="0 0 280 45" width="100%" height="100%" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={isPositive ? '#10b981' : '#f43f5e'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkPoints}
            />
          </svg>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="stock-card-meta">
        <span>RSI(14): <strong style={{ color: 'var(--text-primary)' }}>{stock.rsi_14}</strong></span>
        <span>52W: ${stock.week_52_low.toFixed(0)} - ${stock.week_52_high.toFixed(0)}</span>
      </div>
    </div>
  );
};
