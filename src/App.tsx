import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StockDetail } from './pages/StockDetail';
import { ChatPage } from './pages/ChatPage';
import { Search, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'stocks'>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectStock = (ticker: string) => {
    setSelectedStock(ticker);
  };

  const handleBackToDashboard = () => {
    setSelectedStock(null);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedStock(null);
        }}
        trackedCount={8}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <Search />
            <input
              type="text"
              placeholder="Search ticker (e.g. NVDA, AAPL, TSLA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <div className="quick-badge">
              <Sparkles size={14} />
              <span>Ollama Qwen 3 8B</span>
            </div>
            <button
              onClick={() => {
                setActiveTab('chat');
                setSelectedStock(null);
              }}
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                color: '#fff',
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px var(--accent-cyan-glow)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Ask Copilot
            </button>
          </div>
        </header>

        {/* Page Router */}
        {selectedStock ? (
          <StockDetail ticker={selectedStock} onBack={handleBackToDashboard} />
        ) : activeTab === 'dashboard' ? (
          <Dashboard onSelectStock={handleSelectStock} searchQuery={searchQuery} />
        ) : (
          <ChatPage />
        )}
      </div>
    </div>
  );
}

export default App;
