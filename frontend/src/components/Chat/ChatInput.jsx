/**
 * ChatInput.jsx — Prompt input with send/cancel buttons
 */
import { useState, useRef, useCallback } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { useSSE } from '../../hooks/useSSE';

export default function ChatInput() {
  const [prompt, setPrompt] = useState('');
  const isAIRunning = useAppStore(state => state.isAIRunning);
  const cancelAI = useAppStore(state => state.cancelAI);
  const { sendMessage } = useSSE();
  const textareaRef = useRef(null);

  const handleSend = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isAIRunning) return;
    setPrompt('');
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(trimmed);
  }, [prompt, isAIRunning, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setPrompt(e.target.value);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      className="shrink-0 p-3"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      <div
        className="flex items-end gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Sparkles size={14} style={{ color: 'var(--accent)', marginBottom: '6px', flexShrink: 0 }} />

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to build, fix, or modify your project…"
          rows={1}
          disabled={isAIRunning}
          className="flex-1 resize-none bg-transparent outline-none scrollable"
          style={{
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: '1.5',
            minHeight: '24px',
            maxHeight: '120px',
            fontFamily: 'var(--font-ui)',
            opacity: isAIRunning ? 0.6 : 1,
          }}
        />

        {/* Send / Cancel button */}
        {isAIRunning ? (
          <button
            onClick={cancelAI}
            title="Cancel request"
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', marginBottom: '0px' }}
          >
            <Square size={13} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!prompt.trim()}
            title="Send (Enter)"
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: prompt.trim() ? 'var(--accent)' : 'var(--bg-base)',
              color: prompt.trim() ? '#fff' : 'var(--text-muted)',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={13} />
          </button>
        )}
      </div>
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
