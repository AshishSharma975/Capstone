/**
 * ChatPanel.jsx — Chat interface container
 * Top section of the center panel: message history + SSE timeline + input
 */
import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import AITimeline from './AITimeline';
import ChatInput from './ChatInput';
import EmptyState from '../UI/EmptyState';
import useAppStore from '../../store/useAppStore';

export default function ChatPanel() {
  const { chatHistory } = useAppStore();
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <MessageSquare size={13} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          AI Chat
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollable p-3 flex flex-col gap-4">
        {chatHistory.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start a conversation"
            description="Describe what you want to build or change, and the AI will help you."
          />
        ) : (
          chatHistory.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}

        {/* SSE live progress */}
        <AITimeline />

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
