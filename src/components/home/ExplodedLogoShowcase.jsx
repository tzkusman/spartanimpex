import React from 'react';
import logoImg from '../../assets/spartan-logo.png';

export default function ExplodedLogoShowcase({ className = '' }) {
  return (
    <div className={`relative w-full max-w-lg flex items-center justify-center select-none ${className}`}>

      {/* ── Soft Ambient Neon Aura (Cyan & Cobalt) merged directly into background ── */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-50 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.25) 0%, rgba(30,80,200,0.18) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Logo Container (Pure, Seamless Integration with Hero Background) ── */}
      <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
        {/* The Cleaned Spartan Logo (with SPARTAN IMPEX text, true transparent background) */}
        <img
          src={logoImg}
          alt="Spartan Impex Logo"
          className="w-full h-full object-contain animate-logo-pulse-2d select-none drop-shadow-[0_0_24px_rgba(0,229,255,0.5)]"
        />

        {/* Subtle 2D Laser Scan Beam passing smoothly over the logo */}
        <div className="absolute inset-x-8 h-[2px] pointer-events-none animate-laser-scan-2d z-10 overflow-hidden">
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.85) 50%, transparent 100%)',
              boxShadow: '0 0 12px #00E5FF, 0 0 24px rgba(0,229,255,0.5)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
