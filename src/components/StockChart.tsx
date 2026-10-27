import React, { useRef, useEffect, useState } from 'react';
import { CandleData } from '../types';

interface StockChartProps {
  data: CandleData[];
  ticker: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, ticker }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [timeframe, setTimeframe] = useState<string>('3M');
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter data based on timeframe
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const count = timeframe === '1W' ? 5 : timeframe === '1M' ? 22 : timeframe === '3M' ? 66 : data.length;
    return data.slice(-count);
  }, [data, timeframe]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 65, bottom: 30, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate Min & Max Price
    let minPrice = Math.min(...filteredData.map((d) => d.low));
    let maxPrice = Math.max(...filteredData.map((d) => d.high));
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;

    const getY = (price: number) => padding.top + chartH - ((price - minPrice) / (maxPrice - minPrice)) * chartH;
    const getX = (idx: number) => padding.left + (idx / (filteredData.length - 1 || 1)) * chartW;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Horizontal Grid Lines & Price Labels
    const gridLines = 5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      const price = maxPrice - (i / gridLines) * (maxPrice - minPrice);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`$${price.toFixed(1)}`, width - padding.right + 8, y + 4);
    }

    // SMA 50 Line
    if (showSMA50 && filteredData.some((d) => d.sma_50)) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      filteredData.forEach((d, idx) => {
        if (d.sma_50) {
          const x = getX(idx);
          const y = getY(d.sma_50);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // SMA 20 Line
    if (showSMA20 && filteredData.some((d) => d.sma_20)) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      filteredData.forEach((d, idx) => {
        if (d.sma_20) {
          const x = getX(idx);
          const y = getY(d.sma_20);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw Price Series
    if (chartType === 'area') {
      // Area gradient
      const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      ctx.beginPath();
      filteredData.forEach((d, idx) => {
        const x = getX(idx);
        const y = getY(d.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Fill area
      const lastX = getX(filteredData.length - 1);
      const firstX = getX(0);
      ctx.lineTo(lastX, height - padding.bottom);
      ctx.lineTo(firstX, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      filteredData.forEach((d, idx) => {
        const x = getX(idx);
        const y = getY(d.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Candlestick rendering
      const candleW = Math.max(2, Math.min(14, (chartW / filteredData.length) * 0.7));

      filteredData.forEach((d, idx) => {
        const x = getX(idx);
        const yOpen = getY(d.open);
        const yClose = getY(d.close);
        const yHigh = getY(d.high);
        const yLow = getY(d.low);

        const isGreen = d.close >= d.open;
        const color = isGreen ? '#10b981' : '#f43f5e';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
      });
    }

    // Crosshair & Hover Tooltip
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < filteredData.length) {
      const active = filteredData[hoveredIndex];
      const hX = getX(hoveredIndex);
      const hY = getY(active.close);

      // Vertical guide line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(hX, hY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [filteredData, chartType, showSMA20, showSMA50, hoveredIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 20; // minus left padding
    const chartW = rect.width - 20 - 65;
    const idx = Math.round((x / chartW) * (filteredData.length - 1));
    if (idx >= 0 && idx < filteredData.length) {
      setHoveredIndex(idx);
    }
  };

  const activeCandle = hoveredIndex !== null && filteredData[hoveredIndex] ? filteredData[hoveredIndex] : filteredData[filteredData.length - 1];

  return (
    <div className="glass-card chart-container">
      {/* Chart Top Controls */}
      <div className="chart-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mode Switch */}
          <div className="timeframe-group">
            <button
              className={`timeframe-btn ${chartType === 'candlestick' ? 'active' : ''}`}
              onClick={() => setChartType('candlestick')}
            >
              Candles
            </button>
            <button
              className={`timeframe-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
          </div>

          {/* Indicator toggles */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: showSMA20 ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: showSMA20 ? '#38bdf8' : 'var(--text-muted)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer',
              }}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: showSMA50 ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: showSMA50 ? '#f59e0b' : 'var(--text-muted)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                cursor: 'pointer',
              }}
            >
              SMA 50
            </button>
          </div>
        </div>

        {/* Timeframe Group */}
        <div className="timeframe-group">
          {['1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Bar Meta readout */}
      {activeCandle && (
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          <span>Date: <strong style={{ color: '#fff' }}>{activeCandle.date}</strong></span>
          <span>O: <strong>${activeCandle.open.toFixed(2)}</strong></span>
          <span>H: <strong style={{ color: '#10b981' }}>${activeCandle.high.toFixed(2)}</strong></span>
          <span>L: <strong style={{ color: '#f43f5e' }}>${activeCandle.low.toFixed(2)}</strong></span>
          <span>C: <strong style={{ color: '#38bdf8' }}>${activeCandle.close.toFixed(2)}</strong></span>
          <span>Vol: <strong>{(activeCandle.volume / 1000000).toFixed(1)}M</strong></span>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="chart-canvas-wrapper">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      </div>
    </div>
  );
};
