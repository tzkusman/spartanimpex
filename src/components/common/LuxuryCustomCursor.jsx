import React, { useEffect, useState, useRef } from 'react';

export default function LuxuryCustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState('default'); // 'default', 'pointer', 'robot', 'text'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef();

  useEffect(() => {
    // Only run on devices with a fine pointer (desktop/mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e) => {
      setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });

      // Detect what element is hovered
      const target = e.target;
      if (!target) return;

      const interactive = target.closest('a, button, input, textarea, select, [role="button"], [data-cursor="pointer"]');
      const robotElem = target.closest('[data-cursor="robot"]');
      
      if (robotElem) {
        setCursorType('robot');
      } else if (interactive) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth trailing physics using requestAnimationFrame
    const updateTrailing = () => {
      setTrailingPos((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18,
        };
      });
      requestRef.current = requestAnimationFrame(updateTrailing);
    };

    requestRef.current = requestAnimationFrame(updateTrailing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none hidden md:block">
      {/* Outer Luxury Trailing Ring */}
      <div
        className={`fixed top-0 left-0 rounded-full transition-transform duration-75 ease-out will-change-transform flex items-center justify-center ${
          cursorType === 'pointer'
            ? 'w-12 h-12 -ml-6 -mt-6 bg-cyan-500/15 border-2 border-cyan-400 scale-110 shadow-lg shadow-cyan-500/30'
            : cursorType === 'robot'
            ? 'w-14 h-14 -ml-7 -mt-7 bg-cyan-400/20 border-2 border-cyan-400 scale-125 shadow-cyan-500/50 shadow-md'
            : isMouseDown
            ? 'w-8 h-8 -ml-4 -mt-4 border border-gold scale-90'
            : 'w-9 h-9 -ml-[18px] -mt-[18px] border border-cyan-500/40 bg-cyan-500/5'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
          backdropFilter: cursorType === 'pointer' ? 'blur(2px)' : 'none',
        }}
      >
        {cursorType === 'robot' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        )}
      </div>

      {/* Center Precise Dot */}
      <div
        className={`fixed top-0 left-0 rounded-full transition-all duration-75 will-change-transform ${
          cursorType === 'pointer'
            ? 'w-2 h-2 -ml-1 -mt-1 bg-cyan-400'
            : cursorType === 'robot'
            ? 'w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-cyan-400 shadow-[0_0_8px_#00F0FF]'
            : isMouseDown
            ? 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-gold'
            : 'w-2 h-2 -ml-1 -mt-1 bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.5)]'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
    </div>
  );
}
