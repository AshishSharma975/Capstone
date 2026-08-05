import { useState, useEffect } from 'react';
import StatusBar from '../StatusBar/StatusBar';
import ToastContainer from '../UI/Toast';

export default function AppLayout({ sidebar, centerTop, centerBottom, rightTop, rightBottom }) {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [centerTopHeight, setCenterTopHeight] = useState(300);
  const [rightWidth, setRightWidth] = useState(420);
  const [rightTopHeight, setRightTopHeight] = useState(350);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizeSidebar = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(160, Math.min(400, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizeRightWidth = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizeCenterHeight = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = centerTopHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, Math.min(windowHeight - 150, startHeight + deltaY));
      setCenterTopHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizeRightTopHeight = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = rightTopHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, Math.min(windowHeight - 150, startHeight + deltaY));
      setRightTopHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}
    >
      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div
          style={{
            width: `${sidebarWidth}px`,
            minWidth: '160px',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {sidebar}
        </div>

        {/* Sidebar resize handle */}
        <div
          onMouseDown={startResizeSidebar}
          style={{
            width: '4px',
            cursor: 'col-resize',
            background: 'var(--border)',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--border)'}
        />

        {/* Center panel */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {/* Chat — top */}
          <div
            style={{ height: `${centerTopHeight}px`, minHeight: '120px', overflow: 'hidden' }}
          >
            {centerTop}
          </div>

          {/* Chat resize handle */}
          <div
            onMouseDown={startResizeCenterHeight}
            style={{ height: '4px', width: '100%', background: 'var(--border)', flexShrink: 0, cursor: 'row-resize', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--border)'}
          />

          {/* Preview — bottom */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {centerBottom}
          </div>
        </div>

        {/* Right column resize handle */}
        <div
          onMouseDown={startResizeRightWidth}
          style={{
            width: '4px',
            cursor: 'col-resize',
            background: 'var(--border)',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--border)'}
        />

        {/* Right panel */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${rightWidth}px`, minWidth: '280px', flexShrink: 0 }}
        >
          {/* Editor — top */}
          <div style={{ height: `${rightTopHeight}px`, minHeight: '120px', overflow: 'hidden' }}>
            {rightTop}
          </div>

          {/* Editor resize handle */}
          <div
            onMouseDown={startResizeRightTopHeight}
            style={{ height: '4px', width: '100%', background: 'var(--border)', flexShrink: 0, cursor: 'row-resize', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--border)'}
          />

          {/* Terminal — bottom */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightBottom}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}
