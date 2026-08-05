import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Code2, Terminal, Globe, ArrowRight, LogOut,
  Trash2, Plus, FolderOpen, Zap, Layers, Cpu,
  GitBranch, Shield, Clock, Users, ChevronDown
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { startSandbox, getProjects, deleteProject } from '../services/sandboxApi';
import Spinner from '../components/UI/Spinner';
import ToastContainer from '../components/UI/Toast';

// Reusable scroll-reveal wrapper
const Reveal = ({ children, delay = 0, direction = 'up', style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
      scale: direction === 'scale' ? 0.92 : 1,
    },
    visible: { opacity: 1, y: 0, x: 0, scale: 1 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Stagger container
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const STATS = [
  { value: '< 30s', label: 'Sandbox boot time' },
  { value: '100%', label: 'Isolated environments' },
  { value: 'AI', label: 'Writes & runs code' },
  { value: '∞', label: 'Projects supported' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI Code Agent',
    desc: 'Describe what you want — the agent writes full files, installs packages, and runs your app. No copy-paste needed.',
  },
  {
    icon: Terminal,
    title: 'Live Terminal',
    desc: 'Full shell access inside a secure Kubernetes container. Run commands, see output, debug in real time.',
  },
  {
    icon: Globe,
    title: 'Instant Preview',
    desc: 'Every change reflects live in the browser preview. No manual refresh, no build steps.',
  },
  {
    icon: Shield,
    title: 'Isolated Sandbox',
    desc: 'Each session runs in its own isolated pod. Clean slate every time, no shared state.',
  },
  {
    icon: GitBranch,
    title: 'File Explorer',
    desc: 'Browse, open, and edit every file the AI creates. Full visibility into your project structure.',
  },
  {
    icon: Clock,
    title: 'Auto Cleanup',
    desc: 'Sandboxes expire automatically so you never pay for idle resources. Start fresh any time.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign in', desc: 'One click with Google. No forms, no setup.' },
  { step: '02', title: 'Describe your app', desc: 'Tell the AI what you want to build in plain English.' },
  { step: '03', title: 'Watch it build', desc: 'The agent writes code, runs it, and shows you the live result.' },
  { step: '04', title: 'Iterate', desc: 'Keep chatting to refine, fix bugs, or add features.' },
];

const CODE_DEMO = [
  { type: 'user', text: 'Build me a snake game with score tracking' },
  { type: 'ai', text: '✦ Creating src/SnakeGame.jsx...' },
  { type: 'ai', text: '✦ Creating src/useGameLoop.js...' },
  { type: 'ai', text: '✦ Installing dependencies...' },
  { type: 'ai', text: '✦ Starting dev server on port 5173...' },
  { type: 'success', text: '● Live preview ready at sandbox URL' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, setUser, authChecking, setSandbox, addToast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [projects, setProjects] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [demoStep, setDemoStep] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (user) getProjects().then(setProjects).catch(() => {});
    else setProjects([]);
  }, [user]);

  // Animate demo chat
  useEffect(() => {
    const t = setInterval(() => {
      setDemoStep(v => v < CODE_DEMO.length ? v + 1 : 0);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const handleLogin = () => { window.location.href = '/api/auth/google'; };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    setUser(null); setSandbox(null, null); setProjects([]);
  };

  const handleStart = async (projectId = null) => {
    if (!user) { addToast('Please login first!', 'error'); return; }
    setIsLoading(true);
    setLoadingStep('Provisioning container…');
    try {
      const data = await startSandbox(projectId);
      setSandbox(data.sandboxId, data.previewUrl);
      setLoadingStep('Waiting for environment…');
      let ready = false;
      for (let i = 0; i < 30; i++) {
        try {
          const res = await fetch('/api/agent/list-files', {
            headers: { 'x-sandbox-id': data.sandboxId },
            credentials: 'include',
          });
          if (res.ok) { ready = true; break; }
        } catch {}
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!ready) throw new Error('Sandbox failed to start in time');
      setLoadingStep('Opening workspace…');
      await new Promise(r => setTimeout(r, 400));
      navigate('/workspace');
    } catch (err) {
      addToast(`Failed: ${err.message}`, 'error');
      setIsLoading(false); setLoadingStep('');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      addToast('Project deleted.', 'success');
    } catch (err) { addToast(`Error: ${err.message}`, 'error'); }
    finally { setDeletingId(null); }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg-base)' }} ref={scrollRef}>

      {/* ── Fixed Auth Sidebar ──────────────────────────── */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: '360px', zIndex: 50,
        background: 'rgba(20, 19, 18, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 36px',
        overflowY: 'auto',
      }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Code2 size={13} color="#0f0e0d" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            DevSandbox
          </span>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Start building now
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Sign in to launch your first AI-powered sandbox.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {authChecking ? (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
              <Spinner size={13} /> Checking session…
            </motion.div>

          ) : !user ? (
            <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Google button */}
              <button onClick={handleLogin} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', padding: '12px 20px', borderRadius: '10px',
                background: 'var(--text-primary)', border: 'none',
                color: '#0f0e0d', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '-0.2px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ margin: '20px 0', height: '1px', background: 'var(--border)' }} />

              {/* Trust bullets */}
              {['No credit card required', 'Sandbox ready in under 30s', 'Fully isolated environment'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </motion.div>

          ) : (
            <motion.div key="loggedin" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* User row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#0f0e0d' }}>
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                  }
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name || user.email}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Signed in</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '4px 6px', borderRadius: '5px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <LogOut size={10} /> Out
                </button>
              </div>

              {/* New Sandbox */}
              <button onClick={() => handleStart()} disabled={isLoading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px 20px', borderRadius: '10px',
                background: isLoading ? 'var(--bg-elevated)' : 'var(--accent)',
                border: '1px solid', borderColor: isLoading ? 'var(--border)' : 'transparent',
                color: isLoading ? 'var(--text-muted)' : '#0f0e0d',
                fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(201,169,110,0.3)',
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}}>
                <AnimatePresence mode="wait">
                  {isLoading
                    ? <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Spinner size={14} /><span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{loadingStep}</span></motion.div>
                    : <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Plus size={14} /> New Sandbox</motion.div>
                  }
                </AnimatePresence>
              </button>

              {/* Projects */}
              {projects.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FolderOpen size={11} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projects</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{projects.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {projects.map((proj, i) => (
                      <motion.div key={proj._id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => !isLoading && handleStart(proj._id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: '7px',
                          border: '1px solid transparent', cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '5px', flexShrink: 0, background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code2 size={10} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {proj.title || 'Untitled'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); handleDelete(proj._id); }} disabled={deletingId === proj._id}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,112,112,0.1)'; e.currentTarget.style.color = 'var(--error)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                            {deletingId === proj._id ? <Spinner size={10} /> : <Trash2 size={11} />}
                          </button>
                          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <ArrowRight size={11} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Sandboxes are isolated · Auto-cleaned · Powered by Kubernetes
          </p>
        </div>
      </div>

      {/* ── Main Scrollable Content ─────────────────────── */}
      <div style={{ marginRight: '360px', minHeight: '100vh' }}>

        {/* ── HERO ───────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          padding: '80px 72px', position: 'relative', overflow: 'hidden',
          gap: '60px',
        }}>
          {/* Dot grid bg */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
            backgroundSize: '28px 28px', opacity: 0.35,
          }} />
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.06), transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.04), transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          {/* Left — Text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', maxWidth: '480px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '20px', marginBottom: '28px',
              background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.25)',
              fontSize: '11px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
              AI-Powered Cloud IDE
            </div>

            <h1 style={{ fontSize: '68px', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.0, color: 'var(--text-primary)', marginBottom: '24px' }}>
              Code faster.<br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #e8b86d 50%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }}>Ship smarter.</span>
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px' }}>
              Describe what you want to build. The AI agent writes the code, runs it inside a live sandbox, and shows you the result — instantly.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#0f0e0d', transition: 'all 0.2s' }}
                onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
                See how it works <ArrowRight size={15} />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}>
                See demo
              </button>
            </div>
          </motion.div>

          {/* Right — IDE Mockup Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, position: 'relative', zIndex: 1, minWidth: 0 }}
          >
            {/* Floating label chips */}
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-16px', left: '20px', zIndex: 10,
                display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px',
                background: 'rgba(107,191,142,0.12)', border: '1px solid rgba(107,191,142,0.3)',
                fontSize: '11px', color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 1.5s infinite' }} />
              Sandbox Running
            </motion.div>

            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ position: 'absolute', top: '80px', right: '-12px', zIndex: 10,
                display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px',
                background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.3)',
                fontSize: '11px', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
              <Zap size={10} /> AI Writing Code…
            </motion.div>

            {/* Main IDE window */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
              transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)',
            }}>
              {/* Title bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DevSandbox — snake-game</span>
                </div>
              </div>

              {/* IDE Body */}
              <div style={{ display: 'flex', height: '380px' }}>
                {/* File tree sidebar */}
                <div style={{ width: '140px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '12px 0', background: 'var(--bg-base)' }}>
                  <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Explorer</div>
                  {[
                    { name: 'src', indent: 0, isDir: true },
                    { name: 'SnakeGame.jsx', indent: 1, active: true },
                    { name: 'useGameLoop.js', indent: 1 },
                    { name: 'App.jsx', indent: 1 },
                    { name: 'index.css', indent: 1 },
                    { name: 'package.json', indent: 0 },
                    { name: 'vite.config.js', indent: 0 },
                  ].map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '3px 12px', paddingLeft: `${12 + f.indent * 12}px`,
                      background: f.active ? 'rgba(201,169,110,0.08)' : 'transparent',
                      borderLeft: f.active ? '2px solid var(--accent)' : '2px solid transparent',
                    }}>
                      <span style={{ fontSize: '10px', color: f.active ? 'var(--text-primary)' : f.isDir ? 'var(--text-secondary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {f.isDir ? '📁' : ''} {f.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Code editor + terminal column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  {/* Code area */}
                  <div style={{ flex: 1, padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.65, overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                    {[
                      { num: 1,  color: '#6b7280', text: "// 🤖 AI-generated: SnakeGame.jsx" },
                      { num: 2,  color: '#a78bfa', text: "import React, { useState, useEffect }" },
                      { num: 3,  color: '#a78bfa', text: "  from 'react';" },
                      { num: 4,  color: '', text: '' },
                      { num: 5,  color: '#34d399', text: "const GRID_SIZE = 20;" },
                      { num: 6,  color: '#34d399', text: "const TICK_MS  = 150;" },
                      { num: 7,  color: '', text: '' },
                      { num: 8,  color: '#c9a96e', text: "export default function SnakeGame() {" },
                      { num: 9,  color: '#f0ebe4', text: "  const [snake, setSnake] = useState(" },
                      { num: 10, color: '#fbbf24', text: "    [{ x: 10, y: 10 }]" },
                      { num: 11, color: '#f0ebe4', text: "  );" },
                      { num: 12, color: '#f0ebe4', text: "  const [dir, setDir]  = useState('RIGHT');" },
                      { num: 13, color: '#f0ebe4', text: "  const [score, setScore] = useState(0);" },
                      { num: 14, color: '', text: '' },
                      { num: 15, color: '#6b7280', text: "  // game loop ↓" },
                    ].map(line => (
                      <div key={line.num} style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ color: '#3a3836', userSelect: 'none', minWidth: '16px', textAlign: 'right' }}>{line.num}</span>
                        <span style={{ color: line.color || 'var(--terminal-text)' }}>{line.text}</span>
                      </div>
                    ))}
                    {/* Blinking cursor */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span style={{ color: '#3a3836', minWidth: '16px', textAlign: 'right' }}>16</span>
                      <span style={{ display: 'inline-block', width: '7px', height: '13px', background: 'var(--accent)', opacity: 0.8, animation: 'pulse-glow 1s infinite', verticalAlign: 'middle' }} />
                    </div>
                  </div>

                  {/* Terminal strip */}
                  <div style={{ height: '90px', padding: '10px 14px', background: 'var(--terminal-bg)', fontFamily: 'var(--font-mono)', fontSize: '10.5px', lineHeight: 1.6, overflow: 'hidden' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Terminal</div>
                    <div style={{ color: '#34d399' }}>✔ vite v5.2 ready in 312ms</div>
                    <div style={{ color: 'var(--text-secondary)' }}>➜ Local: <span style={{ color: 'var(--accent)' }}>http://localhost:5173</span></div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>$ <span style={{ display: 'inline-block', width: '5px', height: '11px', background: 'var(--text-muted)', animation: 'pulse-glow 1.2s infinite' }} /></div>
                  </div>
                </div>

                {/* AI Chat side column */}
                <div style={{ width: '170px', flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Zap size={9} style={{ color: 'var(--accent)' }} /> AI Agent
                  </div>
                  <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: '6px 6px 6px 2px', padding: '6px 8px', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Build a snake game with score tracking
                    </div>
                    <div style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '2px 6px 6px 6px', padding: '6px 8px', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      ✦ Creating SnakeGame.jsx...
                    </div>
                    <div style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '2px 6px 6px 6px', padding: '6px 8px', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      ✦ Writing game loop...
                    </div>
                    <div style={{ background: 'rgba(107,191,142,0.08)', border: '1px solid rgba(107,191,142,0.2)', borderRadius: '6px', padding: '6px 8px', fontSize: '10px', color: 'var(--success)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                      Preview live!
                    </div>
                  </div>
                  {/* Chat input */}
                  <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: '6px', padding: '6px 8px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Ask AI...</span>
                      <span style={{ marginLeft: 'auto', display: 'inline-block', width: '4px', height: '10px', background: 'var(--text-muted)', animation: 'pulse-glow 1s infinite' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', bottom: '28px', left: '72px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
            <ChevronDown size={14} /> Scroll to explore
          </motion.div>
        </section>


        {/* ── STATS ──────────────────────────────────────── */}
        <section style={{
          padding: '64px 72px',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--accent)', marginBottom: '6px' }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── AI DEMO ────────────────────────────────────── */}
        <section id="demo" style={{ padding: '100px 72px', borderBottom: '1px solid var(--border)' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>
              Live Demo
            </div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '16px', maxWidth: '520px', lineHeight: 1.1 }}>
              Watch the AI work in real time
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.7, marginBottom: '56px' }}>
              Type a prompt, and watch the agent create files, install packages, and serve your app — all inside an isolated container.
            </p>

            {/* Chat demo window */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px',
              overflow: 'hidden', maxWidth: '580px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Top bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px',
                background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: '10px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  AI Agent · workspace
                </span>
              </div>
              {/* Messages */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
                {CODE_DEMO.slice(0, demoStep).map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {msg.type === 'user' ? (
                      <>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#0f0e0d', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>U</div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{msg.text}</div>
                      </>
                    ) : msg.type === 'success' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(107,191,142,0.08)', borderRadius: '8px', border: '1px solid rgba(107,191,142,0.2)', width: '100%' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--success)' }}>{msg.text}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Zap size={11} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{msg.text}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {demoStep < CODE_DEMO.length && (
                  <span style={{ display: 'inline-block', width: '6px', height: '13px', background: 'var(--accent)', opacity: 0.8, animation: 'pulse-glow 1s infinite' }} />
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ───────────────────────────────────── */}
        <section id="features" style={{ padding: '100px 72px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>
              Features
            </div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '64px', lineHeight: 1.1 }}>
              Everything you need.<br />Nothing you don't.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: '28px 28px', border: '1px solid var(--border)',
                    background: 'var(--bg-base)',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '9px', marginBottom: '16px',
                    background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────── */}
        <section style={{ padding: '100px 72px', borderBottom: '1px solid var(--border)' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>
              How it works
            </div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '64px', lineHeight: 1.1 }}>
              Four steps to your app.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <motion.div key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}>
                  <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', color: 'var(--border)', marginBottom: '20px', lineHeight: 1 }}>{step}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section style={{ padding: '100px 72px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '64px', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
                width: '400px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,169,110,0.08), transparent 65%)',
                filter: 'blur(40px)', pointerEvents: 'none',
              }} />
              <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.05 }}>
                Ready to start building?
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Sign in with the panel on the right and launch your first sandbox in seconds.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 14px', borderRadius: '20px',
                background: 'var(--accent-subtle)', border: '1px solid rgba(201,169,110,0.25)',
                fontSize: '12px', color: 'var(--accent)',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
                No setup required · Starts in &lt;30s
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <div style={{ padding: '24px 72px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={10} color="#0f0e0d" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>DevSandbox</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI-Powered Cloud IDE · Built with ♥</span>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <ToastContainer />
    </div>
  );
}
