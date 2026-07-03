/**
 * ChatMessage.jsx — Individual chat message bubble
 */
import { motion } from 'framer-motion';
import { User, Bot, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
            : 'var(--bg-elevated)',
          border: '1px solid var(--border)',
        }}
      >
        {isUser
          ? <User size={13} style={{ color: '#fff' }} />
          : <Bot size={13} style={{ color: 'var(--accent)' }} />
        }
      </div>

      {/* Bubble */}
      <div
        className="flex-1 max-w-[85%]"
        style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}
      >
        {/* Role label */}
        <span
          style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', paddingLeft: '2px', paddingRight: '2px' }}
        >
          {isUser ? 'You' : 'AI Agent'}
        </span>

        {/* Content */}
        <div
          className="px-3 py-2 rounded-xl"
          style={{
            background: isUser ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
            border: `1px solid ${isUser ? 'var(--accent-glow)' : 'var(--border)'}`,
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: '1.6',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '2px', paddingRight: '2px' }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
