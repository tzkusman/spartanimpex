import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { personalData } from '../../data/portfolioData';
import Container from './Container';
import SocialLinks from './SocialLinks';
import logoImg from '../../assets/spartan-logo.png';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-navy-dark border-t border-navy-border pt-16 pb-12 transition-colors">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-navy-border">

          {/* ── Brand Col ─────────────────────────────────────── */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-9 h-9 rounded-xl bg-navy-card border border-navy-border shadow-sm overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform duration-300">
                <img
                  src={logoImg}
                  alt="Spartan Impex Logo"
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,255,0.5))' }}
                />
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors flex items-center gap-0.5">
                <span className="text-cyan font-black" style={{ textShadow: '0 0 10px rgba(0,229,255,0.6)' }}>
                  SPARTAN
                </span>
                <span className="text-silver mx-1 font-light opacity-60">|</span>
                <span className="text-silver-300 font-semibold tracking-widest text-sm">IMPEX</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse translate-y-0.5" />
            </Link>
            <p className="text-sm text-navy-200 leading-relaxed max-w-sm mb-6">
              {personalData.shortBio}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-400 bg-navy-card px-3.5 py-1.5 rounded-full border border-cyan-500/30">
              <span>{personalData.tagline}</span>
            </div>
          </div>

          {/* ── Quick Links ────────────────────────────────────── */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-100 mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-200">
                {[['Home', '/'], ['About Me', '/about'], ['Skills & Tech', '/skills'], ['Projects', '/projects']].map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} className="hover:text-cyan-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-100 mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-200">
                {[['IT Services', '/services'], ['Journal & Blog', '/blog'], ['Contact', '/contact']].map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} className="hover:text-cyan-400 transition-colors">{label}</Link>
                  </li>
                ))}
                <li>
                  <a href={personalData.resumeUrl} className="hover:text-cyan-400 transition-colors">Resume CV</a>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Connect ────────────────────────────────────────── */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between">
            <div className="w-full md:text-right">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-100 mb-4">
                Connect Directly
              </h4>
              <p className="text-sm text-navy-200 mb-4">
                Open for technical leadership, consulting, and select full-stack contracts.
              </p>
              <div className="flex md:justify-end">
                <SocialLinks variant="circle" />
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-xs font-medium text-navy-200 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-navy-card"
              aria-label="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* ── Copyright ─────────────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-300 gap-4">
          <p>© {new Date().getFullYear()} {personalData.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted with Precision</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
            <span>React & Tailwind CSS</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
