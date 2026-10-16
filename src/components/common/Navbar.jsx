import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { personalData } from '../../data/portfolioData';
import Container from './Container';
import Button from './Button';
import logoImg from '../../assets/spartan-logo.png';

const navItems = [
  { name: 'Home',     path: '/' },
  { name: 'About',    path: '/about' },
  { name: 'Skills',   path: '/skills' },
  { name: 'Projects', path: '/projects' },
  { name: 'Services', path: '/services' },
  { name: 'Pricing',  path: '/pricing' },
  { name: 'Blog',     path: '/blog' },
  { name: 'Contact',  path: '/contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled]         = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-navy-dark/96 backdrop-blur-md border-b border-navy-border shadow-lg py-3'
          : 'bg-navy-dark/80 backdrop-blur-sm py-4'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">

          {/* ── Brand Logo ─────────────────────────────────────── */}
          <Link
            to="/"
            className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-DEFAULT rounded-md"
            aria-label="Spartan Impex Homepage"
          >
            {/* Logo badge */}
            <div className="relative w-10 h-10 rounded-xl bg-navy-card border border-navy-border shadow-sm overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform duration-300">
              <img
                src={logoImg}
                alt="Spartan Impex Logo"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,255,0.5))' }}
              />
              <span className="absolute inset-0 rounded-xl border border-cyan-DEFAULT/30 pointer-events-none group-hover:border-cyan-DEFAULT/70 transition-all duration-300" />
            </div>

            {/* Brand text */}
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors flex items-center gap-0.5">
                <span
                  className="text-cyan-DEFAULT font-black"
                  style={{ textShadow: '0 0 12px rgba(0,229,255,0.7)' }}
                >
                  SPARTAN
                </span>
                <span className="text-silver mx-1 font-light opacity-60">|</span>
                <span className="text-silver-300 font-semibold tracking-widest text-sm md:text-base">IMPEX</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT animate-pulse translate-y-0.5" />
            </div>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────── */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-sm font-medium tracking-wide transition-all duration-200 relative ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-navy-200 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full"
                        style={{ background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── CTA ────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-4">
            <Button to="/contact" variant="primary" size="sm" className="text-xs uppercase tracking-wider font-bold">
              Contact Me
            </Button>
          </div>

          {/* ── Mobile toggle ──────────────────────────────────── */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy-100 hover:text-cyan-DEFAULT transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-DEFAULT rounded-lg"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ───────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-6 border-t border-navy-border bg-navy-card/95 rounded-b-2xl shadow-2xl animate-fadeIn">
            <nav className="flex flex-col space-y-1 px-2" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-navy-muted text-cyan-DEFAULT font-semibold border-l-4 border-cyan-DEFAULT'
                        : 'text-navy-200 hover:bg-navy-muted/60 hover:text-white'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <div className="pt-4 px-2">
                <Button to="/contact" variant="primary" size="md" className="w-full text-center">
                  Contact Me
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
