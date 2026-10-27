import React from 'react';
import { Chat } from '../components/Chat';
import { Bot, Sparkles, Database, Cpu } from 'lucide-react';

export const ChatPage: React.FC = () => {
  return (
    <div className="content-container" style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Info Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={28} color="var(--accent-cyan)" />
            <span>Fin AI Mine Financial Copilot</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Multi-tool financial intelligence powered by LangChain, Delta Lake Medallion tables, and Ollama.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="quick-badge">
            <Database size={14} />
            <span>Delta Lake</span>
          </div>
          <div className="quick-badge" style={{ background: 'rgba(6, 182, 212, 0.12)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#38bdf8' }}>
            <Cpu size={14} />
            <span>Qwen 3 8B</span>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div style={{ flex: 1, minHeight: '520px' }}>
        <Chat height="100%" />
      </div>
    </div>
  );
};
