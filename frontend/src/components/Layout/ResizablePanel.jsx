/**
 * ResizablePanel.jsx — Drag-to-resize panel wrapper
 *
 * Renders N children with drag handles between them.
 * direction: 'horizontal' (side-by-side) | 'vertical' (stacked)
 * initialSizes: percentage array summing to 100, one per child
 */
import { useRef, useCallback, Children, useState, useEffect } from 'react';

export default function ResizablePanel({
  direction = 'horizontal',
  initialSizes,
  children,
  className = '',
}) {
  const childArray = Children.toArray(children);
  const count = childArray.length;
  const defaultSizes = initialSizes || Array(count).fill(100 / count);

  const [sizes, setSizes] = useState(defaultSizes);
  const containerRef = useRef(null);
  const isHorizontal = direction === 'horizontal';

  const startResize = useCallback(
    (e, handleIdx) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const startPos = isHorizontal ? e.clientX : e.clientY;
      const totalSize = isHorizontal ? container.offsetWidth : container.offsetHeight;
      const startSizes = [...sizes];

      const onMove = (moveEvent) => {
        const currentPos = isHorizontal
          ? (moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX ?? startPos)
          : (moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY ?? startPos);

        const delta = ((currentPos - startPos) / totalSize) * 100;
        const minPct = 12;

        setSizes((prev) => {
          const next = [...prev];
          const left = Math.max(minPct, startSizes[handleIdx] + delta);
          const right = Math.max(minPct, startSizes[handleIdx + 1] - delta);
          // Ensure they sum to their original combined value
          const total = startSizes[handleIdx] + startSizes[handleIdx + 1];
          if (left + right < total - 0.1 || left + right > total + 0.1) return prev;
          next[handleIdx] = left;
          next[handleIdx + 1] = right;
          return next;
        });
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    },
    [isHorizontal, sizes]
  );

  // Build the flat list of: panel, handle, panel, handle, …
  const elements = [];
  childArray.forEach((child, i) => {
    elements.push(
      <div
        key={`panel-${i}`}
        style={{
          [isHorizontal ? 'width' : 'height']: `${sizes[i]}%`,
          [isHorizontal ? 'height' : 'width']: '100%',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {child}
      </div>
    );

    if (i < count - 1) {
      elements.push(
        <div
          key={`handle-${i}`}
          onMouseDown={(e) => startResize(e, i)}
          onTouchStart={(e) => startResize(e, i)}
          style={{
            [isHorizontal ? 'width' : 'height']: '4px',
            [isHorizontal ? 'height' : 'width']: '100%',
            background: 'var(--border)',
            cursor: isHorizontal ? 'col-resize' : 'row-resize',
            flexShrink: 0,
            zIndex: 10,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
        />
      );
    }
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {elements}
    </div>
  );
}
