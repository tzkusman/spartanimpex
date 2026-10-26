import React from 'react';
import { ArrowRight, Download, Shield } from 'lucide-react';
import { personalData } from '../../data/portfolioData';
import Container from '../common/Container';
import Button from '../common/Button';
import SocialLinks from '../common/SocialLinks';
import ExplodedLogoShowcase from './ExplodedLogoShowcase';

export default function Hero() {
  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden" style={{ background: '#071525' }}>
      {/* Ambient orbs */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -z-10 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(30,80,200,0.35) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10 opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.20) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Subtle horizontal circuit lines */}
      <div className="absolute inset-x-0 top-1/3 h-px opacity-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)' }} />
      <div className="absolute inset-x-0 top-2/3 h-px opacity-8 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #1E50C8, transparent)' }} />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Left Column ─────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col items-start">

            {/* Badge */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-card border border-navy-border shadow-md">
                <Shield size={12} className="text-cyan-DEFAULT" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-white">
                  <span style={{ color: '#00E5FF' }}>SPARTAN</span>
                  {' '}•{' '}
                  <span className="text-silver">IMPEX IT SERVICES</span>
                </span>
              </div>
              <span className="text-xs uppercase tracking-widest font-semibold text-silver-500">
                OFFICIAL PORTFOLIO
              </span>
            </div>

            {/* Main heading — matches logo typography */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tight leading-none mb-2">
              <span
                className="block"
                style={{
                  color: '#E8EEF8',
                  WebkitTextStroke: '1px rgba(0,229,255,0.15)',
                  textShadow: '0 0 40px rgba(30,80,200,0.3)',
                }}
              >
                SPARTAN
              </span>
              <span
                className="block text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[0.3em] mt-1"
                style={{
                  color: '#00E5FF',
                  textShadow: '0 0 20px rgba(0,229,255,0.7)',
                  letterSpacing: '0.35em',
                }}
              >
                IMPEX
              </span>
            </h1>

            {/* Cyan divider line */}
            <div
              className="w-32 h-0.5 mt-4 mb-6 rounded-full"
              style={{ background: 'linear-gradient(90deg, #00E5FF, #1E50C8, transparent)' }}
            />

            {/* Role tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-card border border-cobalt/40 text-sm font-medium text-silver mb-6 tracking-wide">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
              {personalData.title}
            </div>

            {/* Bio */}
            <p className="text-base sm:text-lg leading-relaxed max-w-xl mb-8" style={{ color: '#A8BCCF' }}>
              {personalData.shortBio}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Button to="/projects" variant="primary" size="md" icon={ArrowRight} iconPosition="right" className="shadow-md">
                View Our Projects
              </Button>
              <Button
                href={personalData.resumeUrl}
                download="Spartan-Impex-Company-Portfolio.pdf"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="md"
                icon={Download}
                iconPosition="left"
              >
                Download Portfolio
              </Button>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-3 border-t border-navy-border/60 w-full max-w-md">
              <span className="text-xs uppercase tracking-wider font-semibold text-navy-300">Follow Us:</span>
              <SocialLinks iconSize={18} />
            </div>
          </div>

          {/* ── Right Column: Logo Showcase ─────────────────────── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ExplodedLogoShowcase />
          </div>
        </div>
      </Container>
    </section>
  );
}
