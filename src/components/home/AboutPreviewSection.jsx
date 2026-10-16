import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Zap, Users } from 'lucide-react';
import { personalData } from '../../data/portfolioData';
import Container from '../common/Container';
import Button from '../common/Button';

export default function AboutPreviewSection() {
  const stats = [
    { value: personalData.yearsExperience,  label: 'Years Experience',       icon: Award },
    { value: personalData.projectsCompleted, label: 'Projects Completed',     icon: Zap   },
    { value: personalData.happyClients,      label: 'Happy Clients & Partners', icon: Users },
  ];

  return (
    <section className="py-16 md:py-24 bg-navy-card border-b border-navy-border">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Stats Cards ──────────────────────────────────────── */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-navy p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-5 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-500 flex-shrink-0 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/50 transition-all duration-300">
                    <Icon size={26} />
                  </div>
                  <div>
                    <div className="font-serif text-3xl sm:text-4xl font-medium text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-navy-300 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Story ────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-[1.5px] bg-cyan" />
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan">
                ENGINEERING PHILOSOPHY
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-white leading-tight mb-6">
              Precision Architecture,{' '}
              <span className="text-cyan-400">Timeless</span> Craftsmanship
            </h2>

            <p className="text-base text-navy-200 leading-relaxed mb-4">
              {personalData.aboutBio[0]}
            </p>
            <p className="text-base text-navy-200 leading-relaxed mb-8">
              {personalData.aboutBio[1]}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button to="/about" variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Learn More About Us
              </Button>
              <Button to="/skills" variant="secondary" size="md">
                View Skills & Tech
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
