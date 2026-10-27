import React from 'react';
import { LayoutDashboard, MessageSquare, TrendingUp, Cpu, Database } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'chat' | 'stocks';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'stocks') => void;
  trackedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, trackedCount }) => {
  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="logo-badge">
          <TrendingUp />
        </div>
        <div className="logo-text">
          <h1>Fin AI Mine</h1>
          <span>Delta Lake · LangChain</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare />
          <span>AI Copilot</span>
        </button>
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div className="footer-status" style={{ marginBottom: '8px' }}>
          <div className="pulse-dot"></div>
          <span style={{ fontWeight: 600 }}>Medallion Pipeline Live</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} />
          <span>PySpark & Delta Lake (Local)</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <Cpu size={14} />
          <span>Ollama Qwen 3 8B</span>
        </div>
      </div>
    </aside>
  );
};
