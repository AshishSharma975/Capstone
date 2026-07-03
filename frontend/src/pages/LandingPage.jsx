/**
 * LandingPage.jsx — Start screen with sandbox creation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Code2, Terminal, Globe, Sparkles, ArrowRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { startSandbox } from '../services/sandboxApi';
import Spinner from '../components/UI/Spinner';
import ToastContainer from '../components/UI/Toast';

const FEATURES = [
  { icon: Code2, label: 'AI Code Generation', desc: 'Describe and build' },
  { icon: Terminal, label: 'Live Terminal', desc: 'Full shell access' },
  { icon: Globe, label: 'Instant Preview', desc: 'Hot-reload browser' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setSandbox, addToast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleStart = async () => {
    setIsLoading(true);
    setLoadingStep('Initialising sandbox environment…');

    try {
      setLoadingStep('Provisioning container…');
      const data = await startSandbox();

      setLoadingStep('Connecting to sandbox…');
      setSandbox(data.sandboxId, data.previewUrl);

      setLoadingStep('Ready! Opening workspace…');
      await new Promise((r) => setTimeout(r, 600));

      navigate('/workspace');
    } catch (err) {
      addToast(`Failed to start sandbox: ${err.message}`, 'error');
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div
      className="gradient-bg"
      style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '24px' }}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}
      >
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-glow)', fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}
          >
            <Sparkles size={12} />
            AI-Powered Cloud Development
          </motion.div>
        </div>

        {/* Main card */}
        <div
          className="glass rounded-2xl p-8 text-center"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', boxShadow: 'var(--shadow-glow)' }}
          >
            <Zap size={28} color="#fff" strokeWidth={2.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2 }}
          >
            DevSandbox
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}
          >
            A cloud IDE with AI assistance. Describe what you want to build — your AI agent writes the code, runs it, and shows you the result live.
          </motion.p>

          {/* Features row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 justify-center mb-8 flex-wrap"
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', minWidth: '100px', flex: 1 }}
              >
                <Icon size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={handleStart}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-white transition-all"
            style={{
              background: isLoading
                ? 'var(--bg-elevated)'
                : 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
              boxShadow: isLoading ? 'none' : 'var(--shadow-glow)',
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              color: '#fff',
            }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Spinner size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{loadingStep}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Zap size={16} />
                  Start Sandbox
                  <ArrowRight size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}
        >
          Sandbox spins up in seconds. No setup required.
        </motion.p>
      </motion.div>

      <ToastContainer />
    </div>
  );
}
