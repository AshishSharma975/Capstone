/**
 * AITimeline.jsx — Live streaming SSE step timeline
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const STEP_ICONS = {
  start: <Play size={11} className="text-[var(--accent)]" />,
  step: <ChevronRight size={11} className="text-[var(--text-muted)]" />,
  complete: <CheckCircle2 size={11} className="text-green-400" />,
  error: <XCircle size={11} className="text-red-400" />,
};

const STEP_COLORS = {
  start: 'var(--accent)',
  step: 'var(--text-secondary)',
  complete: '#22d3a0',
  error: '#f87171',
};

export default function AITimeline() {
  const sseProgress = useAppStore(state => state.sseProgress);
  const isAIRunning = useAppStore(state => state.isAIRunning);

  if (sseProgress.length === 0 && !isAIRunning) return null;

  return (
    <div
      className="mx-3 my-2 rounded-lg overflow-hidden"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {isAIRunning ? (
          <Loader2 size={12} className="text-[var(--accent)] animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <CheckCircle2 size={12} className="text-green-400" />
        )}
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {isAIRunning ? 'AI Agent Running…' : 'Completed'}
        </span>
      </div>

      {/* Steps */}
      <div className="p-2 flex flex-col gap-0.5 max-h-32 overflow-y-auto scrollable">
        <AnimatePresence>
          {sseProgress.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2 px-2 py-1 rounded"
            >
              <span className="mt-0.5 shrink-0">{STEP_ICONS[step.type] || STEP_ICONS.step}</span>
              <span
                style={{
                  fontSize: '12px',
                  color: STEP_COLORS[step.type] || 'var(--text-secondary)',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {step.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pulsing cursor while running */}
        {isAIRunning && (
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-[var(--accent)]"
                  style={{
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}
