import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function CtaBanner() {
  return (
    <section className="py-12 md:py-16 bg-navy">
      <Container>
        <div className="relative overflow-hidden bg-navy-dark rounded-3xl p-8 sm:p-12 md:p-16 border border-navy-border text-white shadow-2xl">
          {/* Cyan glow top-right */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          {/* Cobalt glow bottom-left */}
          <div
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(30,80,200,0.20) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          {/* Animated laser border lines */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent animate-laser-line" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cobalt-400/50 to-transparent animate-laser-line" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs uppercase tracking-widest font-semibold">
                <Sparkles size={14} className="text-cyan-400" />
                <span>START A COLLABORATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-white mb-3 leading-tight">
                Let's Build Something{' '}
                <span className="text-cyan-400">Great.</span>
              </h2>
              <p className="text-sm sm:text-base text-navy-200 font-normal leading-relaxed">
                Have a project in mind, need technical architecture review, or looking to scale your engineering team?
                Let's connect and create something impactful together.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Button
                to="/contact"
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="font-semibold shadow-lg hover:shadow-xl"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
