import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2
} from 'lucide-react';
import { GithubIcon } from '../components/common/BrandIcons';
import { projectsData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import CtaBanner from '../components/home/CtaBanner';

export default function ProjectDetailPage() {
  const { slug } = useParams();

  const project = projectsData.find((p) => p.slug === slug);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImage(0);
  }, [slug]);

  if (!project) {
    return (
      <div className="py-24 text-center bg-navy min-h-screen text-white">
        <Container>
          <h1 className="text-3xl font-serif font-medium text-white mb-4">Project Not Found</h1>
          <p className="text-navy-200 mb-8">The project you are looking for does not exist or has been moved.</p>
          <Button to="/projects" variant="primary">
            Return to Projects
          </Button>
        </Container>
      </div>
    );
  }

  const galleryImages = project.gallery && project.gallery.length > 0 
    ? project.gallery 
    : [project.thumbnail];

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge={project.category}
        title={project.title}
        description={project.shortDescription}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: project.title }
        ]}
      />

      {/* Main Content Section */}
      <section className="py-12 md:py-16 bg-navy">
        <Container>
          {/* Back button */}
          <div className="mb-8">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-navy-300 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to All Projects</span>
            </Link>
          </div>

          {/* Large Hero Mockup Display */}
          <div className="bg-navy-card p-4 sm:p-6 rounded-3xl border border-navy-border shadow-2xl mb-12">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-navy-dark shadow-sm">
              <img
                src={galleryImages[activeImage]}
                alt={`${project.title} Preview ${activeImage + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Thumbnail carousel selector */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-[1.02]'
                        : 'border-navy-border opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View screenshot ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Narrative, Problem, Solution, Features */}
            <div className="lg:col-span-8 space-y-10">
              {/* Project Overview */}
              <div className="bg-navy-card p-6 sm:p-8 rounded-3xl border border-navy-border shadow-xl">
                <h2 className="font-serif text-2xl font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></span>
                  <span>Project Overview</span>
                </h2>
                <p className="text-base text-navy-200 leading-relaxed">
                  {project.overview}
                </p>
              </div>

              {/* Problem & Solution Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-navy-card p-6 rounded-3xl border border-navy-border shadow-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800 inline-block mb-3">
                    The Challenge
                  </span>
                  <h3 className="font-serif text-xl font-medium text-white mb-3">
                    Problem Statement
                  </h3>
                  <p className="text-sm text-navy-200 leading-relaxed">
                    {project.problem}
                  </p>
                </div>

                <div className="bg-navy-card p-6 rounded-3xl border border-navy-border shadow-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800 inline-block mb-3">
                    Engineering Strategy
                  </span>
                  <h3 className="font-serif text-xl font-medium text-white mb-3">
                    Architectural Solution
                  </h3>
                  <p className="text-sm text-navy-200 leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-navy-card p-6 sm:p-8 rounded-3xl border border-navy-border shadow-xl">
                <h2 className="font-serif text-2xl font-medium text-white mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_8px_#00E5FF]"></span>
                  <span>Key Features & Capabilities</span>
                </h2>
                <ul className="space-y-4">
                  {project.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-navy-200 leading-relaxed">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Project Links, Metadata, Tech Stack Badges */}
            <div className="lg:col-span-4 space-y-6">
              {/* Project Action Links */}
              <div className="bg-navy-card p-6 rounded-3xl border border-navy-border shadow-xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
                  Project Links
                </h3>
                <div className="space-y-3">
                  {project.liveUrl && (
                    <Button
                      href={project.liveUrl}
                      variant="primary"
                      size="md"
                      icon={ExternalLink}
                      iconPosition="right"
                      className="w-full justify-between"
                    >
                      Launch Live Demo
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button
                      href={project.githubUrl}
                      variant="secondary"
                      size="md"
                      icon={GithubIcon}
                      iconPosition="right"
                      className="w-full justify-between"
                    >
                      Inspect Source Code
                    </Button>
                  )}
                </div>
              </div>

              {/* Technology Stack Badges */}
              <div className="bg-navy-card p-6 rounded-3xl border border-navy-border shadow-xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
                  Tech Stack Applied
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-navy text-cyan-300 font-medium border border-navy-border hover:border-cyan-500/50 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata specification */}
              <div className="bg-navy-card p-6 rounded-3xl border border-navy-border shadow-xl divide-y divide-navy-border text-xs">
                <div className="pb-3 flex justify-between items-center">
                  <span className="text-navy-300 uppercase font-semibold">Category</span>
                  <span className="text-white font-medium">{project.category}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-navy-300 uppercase font-semibold">Architecture</span>
                  <span className="text-white font-medium">Headless SPA / Cloud Native</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-navy-300 uppercase font-semibold">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Production Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </div>
  );
}
