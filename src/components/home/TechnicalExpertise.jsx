import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Smartphone, Cpu, Cloud, ShieldCheck, Network, Database, Wrench, ArrowRight
} from 'lucide-react';
import { technicalExpertiseCategories } from '../../data/portfolioData';
import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';

const iconMap = { Globe, Smartphone, Cpu, Cloud, ShieldCheck, Network, Database, Wrench };

export default function TechnicalExpertise() {
  return (
    <section className="py-16 md:py-20 bg-navy">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            subtitle="CAPABILITIES"
            title="My Technical Expertise"
            description="Technologies and tools I leverage to craft resilient, scalable software systems."
            className="mb-0"
          />
          <Link
            to="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>Explore All Services</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {technicalExpertiseCategories.map((item) => {
            const IconComponent = iconMap[item.iconName] || Globe;
            return (
              <div
                key={item.id}
                className="group relative bg-navy-card p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-500 mb-5 group-hover:scale-110 group-hover:bg-cyan-500/15 group-hover:border-cyan-500/60 transition-all duration-300">
                    <IconComponent size={22} />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg font-medium text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-navy-200 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-navy-border/50 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-navy-300 font-semibold">
                    Core Speciality
                  </span>
                  <Link
                    to={item.link}
                    className="text-xs font-medium text-cyan hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
