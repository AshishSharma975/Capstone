/**
 * PreviewPanel.jsx — Live preview iframe panel
 */
import { useState, useRef } from 'react';
import { RefreshCw, ExternalLink, Monitor, AlertTriangle } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import Spinner from '../UI/Spinner';

export default function PreviewPanel() {
  const previewUrl = useAppStore(state => state.previewUrl);
  const previewKey = useAppStore(state => state.previewKey);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Force re-render by updating the key via store
    useAppStore.getState().refreshPreview();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    if (previewUrl) window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <Monitor size={13} style={{ color: 'var(--accent)' }} />
        <span
          style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}
        >
          Preview
        </span>

        {/* URL pill */}
        {previewUrl && (
          <div
            className="flex-1 max-w-xs px-2 py-0.5 rounded text-xs truncate"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}
          >
            {previewUrl}
          </div>
        )}

        <button
          onClick={handleRefresh}
          title="Refresh preview"
          className="p-1.5 rounded hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <RefreshCw size={13} />
        </button>
        <button
          onClick={openInNewTab}
          title="Open in new tab"
          className="p-1.5 rounded hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          disabled={!previewUrl}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Monitor size={32} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No preview available</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Start a sandbox to see your app live</p>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: 'var(--bg-base)' }}
              >
                <div className="flex flex-col items-center gap-3">
                  <Spinner size={24} style={{ color: 'var(--accent)' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading preview…</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {hasError && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                style={{ background: 'var(--bg-base)' }}
              >
                <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>Preview unavailable</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>The sandbox may still be starting up</p>
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
                >
                  Try again
                </button>
              </div>
            )}

            <iframe
              key={previewKey}
              ref={iframeRef}
              src={previewUrl}
              onLoad={handleLoad}
              onError={handleError}
              title="App Preview"
              className="w-full h-full border-0"
              style={{ display: hasError ? 'none' : 'block' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </>
        )}
      </div>
    </div>
  );
}
