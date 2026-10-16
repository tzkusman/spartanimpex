import React, { useEffect, useState, useRef } from 'react';

/**
 * CyberItCursor - Precision Cyan Custom Cursor
 * - Perfect pixel-accurate centering via translate(-50%, -50%)
 * - 0ms immediate center dot tracking
 * - Smooth lerp trailing targeting reticle ring (no CSS transition conflict on transform)
 * - Interactive hover snap with cyber corner brackets
 * - Text caret mode for form inputs
 * - Tactile click shockwave ripple
 */
export default function CyberItCursor() {
  const [cursorState, setCursorState] = useState('default'); // 'default' | 'pointer' | 'text'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rippleRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    // Only activate for fine pointer devices (desktop mouse/trackpad)
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // Force default cursor to be hidden on root
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) {
        setIsVisible(true);
        // Initialize ring immediately at mouse position so it starts centered
        ringPos.current = { x: e.clientX, y: e.clientY };
      }

      // Immediate 0ms center dot positioning - perfectly centered via translate(-50%, -50%)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Check hovered element
      const target = e.target;
      if (!target) return;

      const isInput = target.closest('input, textarea, [contenteditable="true"]');
      const isInteractive = target.closest('a, button, [role="button"], select, .cursor-pointer, [data-cursor="pointer"], input[type="submit"]');

      if (isInput) {
        setCursorState('text');
      } else if (isInteractive) {
        setCursorState('pointer');
      } else {
        setCursorState('default');
      }
    };

    const onMouseDown = () => {
      setIsMouseDown(true);
      if (rippleRef.current) {
        rippleRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%) scale(0.6)`;
        rippleRef.current.style.opacity = '1';
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%) scale(2.2)`;
            rippleRef.current.style.opacity = '0';
          }
        }, 16);
      }
    };

    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp physics for trailing ring
    const renderLoop = () => {
      const lerpSpeed = 0.35; // Snappy and fluid
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpSpeed;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpSpeed;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none hidden md:block">

      {/* 1. Click Shockwave Wave - perfectly centered */}
      <div
        ref={rippleRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-cyan-400 pointer-events-none transition-all duration-500 ease-out opacity-0 will-change-transform shadow-[0_0_14px_#00E5FF]"
        style={{ transform: 'translate(-50%, -50%) scale(0)' }}
      />

      {/* 2. Trailing Outer Targeting Reticle - perfectly centered via translate(-50%, -50%) */}
      {/* NOTE: Do NOT transition transform in CSS so it never fights the JS lerp loop! */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center pointer-events-none will-change-transform transition-[width,height,background-color,border-color,box-shadow,opacity] duration-200 ease-out ${
          cursorState === 'pointer'
            ? 'w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-400/10 shadow-[0_0_22px_rgba(0,229,255,0.6)]'
            : cursorState === 'text'
            ? 'w-6 h-9 rounded-md border border-cyan-300/80 bg-cyan-400/5'
            : isMouseDown
            ? 'w-7 h-7 rounded-full border border-cyan-400 scale-90'
            : 'w-9 h-9 rounded-full border border-cyan-400/60 bg-cyan-400/5 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
        }`}
        style={{ transform: `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)` }}
      >
        {/* 4 Corner Crosshairs when hovering interactive targets */}
        {cursorState === 'pointer' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute -top-1 w-2 h-[1.5px] bg-cyan-300" />
            <span className="absolute -bottom-1 w-2 h-[1.5px] bg-cyan-300" />
            <span className="absolute -left-1 h-2 w-[1.5px] bg-cyan-300" />
            <span className="absolute -right-1 h-2 w-[1.5px] bg-cyan-300" />
          </div>
        )}
      </div>

      {/* 3. Instant 0ms Center Core Dot - perfectly centered via translate(-50%, -50%) */}
      {/* NOTE: No CSS transition on transform so it locks onto the exact mouse pixel without lag! */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none will-change-transform transition-[width,height,background-color,box-shadow] duration-150 ${
          cursorState === 'pointer'
            ? 'w-2 h-2 bg-cyan-300 shadow-[0_0_12px_#00E5FF]'
            : cursorState === 'text'
            ? 'w-0.5 h-4 bg-cyan-400 rounded-none shadow-[0_0_8px_#00E5FF]'
            : isMouseDown
            ? 'w-1.5 h-1.5 bg-cyan-300 shadow-[0_0_8px_#00E5FF]'
            : 'w-2 h-2 bg-cyan-400 shadow-[0_0_10px_#00E5FF]'
        }`}
        style={{ transform: `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)` }}
      />
    </div>
  );
}
