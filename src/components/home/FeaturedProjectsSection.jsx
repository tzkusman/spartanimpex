import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { projectsData } from '../../data/portfolioData';
import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import Button from '../common/Button';

export default function FeaturedProjectsSection() {
  const featuredProjects = projectsData.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-navy-card border-y border-navy-border">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            subtitle="PORTFOLIO"
            title="Featured Projects"
            description="Handcrafted engineering projects demonstrating end-to-end full-stack and cloud mastery."
            className="mb-0"
          />
          <Link
            to="/projects"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>Explore All Projects</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-navy rounded-2xl border border-navy-border hover:border-cyan-500/50 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-muted">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-navy/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-cyan-400 tracking-wide border border-navy-border">
                  {project.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="block group-hover:text-cyan-400 transition-colors"
                  >
                    <h3 className="font-serif text-lg font-medium text-white mb-2 leading-snug">
                      {project.title}
                    </h3>
                  </Link>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-navy-muted text-navy-200 border border-navy-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-navy-300 line-clamp-2 mb-4 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-navy-border/60 flex items-center gap-2">
                  <Button
                    to={`/projects/${project.slug}`}
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs py-1.5"
                  >
                    View Details
                  </Button>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-navy-border text-navy-200 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                    aria-label={`GitHub repository for ${project.title}`}
                  >
                    <GithubIcon size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
