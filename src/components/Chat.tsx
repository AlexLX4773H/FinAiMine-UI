import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatProps {
  tickerContext?: string;
  stockSnapshot?: any;
  height?: string;
}

export const Chat: React.FC<ChatProps> = ({ tickerContext, stockSnapshot, height }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: tickerContext
        ? `Hello! I'm your Fin AI Mine Copilot. I'm connected to the Medallion Delta Lake and have pre-loaded **${tickerContext}**'s live metrics, indicators, and ML forecasts. How can I help?`
        : `Welcome to **Fin AI Mine**! I can query real-time stock prices, news sentiment, company fundamentals, and ML predictions across our PySpark Delta Lake warehouse. What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tickerContext,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const replyText = await sendChatMessage(query, tickerContext, stockSnapshot);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tickerContext,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: 'Apologies, I encountered an issue querying the agent tools. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Quick Chips
  const promptChips = tickerContext
    ? [
        `Predict next-day close for ${tickerContext}`,
        `Show technical indicators & RSI for ${tickerContext}`,
        `Recent news sentiment for ${tickerContext}`,
        `Compare ${tickerContext} vs MSFT`,
      ]
    : [
        'Predict next-day close for NVDA',
        'Compare AAPL vs MSFT vs GOOGL',
        'Top market sentiment & movers today',
        'Analyze TSLA technical breakdown',
      ];

  // Simple Markdown Parser for clean rendering
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ margin: '10px 0 6px 0', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={idx} style={{ paddingLeft: '12px', margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: '• ' + processed.replace(/^[-•]\s*/, '') }} />;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={idx} style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '10px', color: 'var(--text-secondary)', margin: '8px 0', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: processed.replace(/^>\s*/, '') }} />;
      }
      return <p key={idx} style={{ margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <div className="chat-container" style={{ height: height || '100%' }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <Bot size={20} color="var(--accent-cyan)" />
          <span>Fin AI Mine Agent</span>
          {tickerContext && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-accent)' }}>
              Context: {tickerContext}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Sparkles size={14} color="#a855f7" />
          <span>Qwen 3 8B</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.75rem', opacity: 0.75 }}>
              {m.sender === 'assistant' ? <Bot size={13} /> : <User size={13} />}
              <span>{m.sender === 'assistant' ? 'Fin AI Mine' : 'You'}</span>
              <span>• {m.timestamp}</span>
            </div>
            <div>{renderFormatted(m.content)}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={16} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Querying Delta Lake & ML model...</span>
            <div className="pulse-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="chips-row">
        {promptChips.map((chip, idx) => (
          <button key={idx} className="chip-btn" onClick={() => handleSend(chip)}>
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder={tickerContext ? `Ask about ${tickerContext} price, prediction, RSI...` : 'Ask anything about stocks, predictions, technicals, fundamentals...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="send-btn" onClick={() => handleSend()} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
