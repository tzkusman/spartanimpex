import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Container from './Container';

export default function PageHeader({ badge, title, description, breadcrumbs = [] }) {
  return (
    <div className="pt-10 pb-12 md:pt-14 md:pb-16 border-b border-navy-border bg-gradient-to-b from-navy-dark to-navy">
      <Container>
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-navy-300 mb-4">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={12} className="text-navy-400" />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-cyan-400 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {badge && (
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-5 h-[1.5px] bg-cyan" />
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan">
              {badge}
            </span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-tight max-w-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-4 text-base sm:text-lg text-navy-200 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </Container>
    </div>
  );
}
