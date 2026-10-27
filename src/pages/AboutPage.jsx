import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/common/BrandIcons';
import React, { useState } from 'react';
import { 
  Download, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Target, 
  CheckCircle, 
  Code2
} from 'lucide-react';
import { personalData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import CtaBanner from '../components/home/CtaBanner';
import logoImg from '../assets/spartan-logo.jpg';

export default function AboutPage() {
  const [imgError, setImgError] = useState(false);

  const journeyIcons = {
    education: GraduationCap,
    experience: Briefcase,
    goals: Target
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge="BIOGRAPHY & BACKGROUND"
        title="About Me"
        description="Know more about my journey, engineering philosophy, and what drives me to build impactful software."
        breadcrumbs={[{ label: 'About' }]}
      />

      {/* Main Intro & Portrait Section */}
      <section className="py-14 md:py-20 bg-navy">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Bio Column */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mb-4">
                Hi, I'm {personalData.name}
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-navy-200 leading-relaxed mb-8">
                {personalData.aboutBio.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* 3 Metric counters */}
              <div className="grid grid-cols-3 gap-4 w-full pt-4 pb-8 border-y border-navy-border">
                <div className="text-center sm:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                    {personalData.yearsExperience}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-navy-300 mt-1 font-medium">
                    Years Experience
                  </div>
                </div>

                <div className="text-center sm:text-left border-x border-navy-border px-3 sm:px-6">
                  <div className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                    {personalData.projectsCompleted}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-navy-300 mt-1 font-medium">
                    Projects Done
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                    {personalData.happyClients}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-navy-300 mt-1 font-medium">
                    Happy Clients
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  href={personalData.resumeUrl}
                  download="Spartan-Impex-Company-Portfolio.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="md"
                  icon={Download}
                  iconPosition="left"
                >
                  Download Company Portfolio (PDF)
                </Button>
                <Button
                  to="/contact"
                  variant="secondary"
                  size="md"
                >
                  Let's Connect
                </Button>
              </div>
            </div>

            {/* Portrait column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="bg-navy-card p-4 rounded-3xl border border-navy-border shadow-2xl">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-navy-dark p-4 border border-navy-border/60 flex items-center justify-center">
                    {!imgError ? (
                      <img
                        src={logoImg}
                        alt="Spartan Impex Logo"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-navy-dark p-8 text-center">
                        <Code2 size={48} className="text-cyan-400 mb-3" />
                        <span className="font-serif text-xl font-medium text-white">
                          {personalData.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-navy-300">
                        Profile Verified
                      </span>
                      <p className="text-sm font-serif font-medium text-white">
                        {personalData.title.split('|')[0]}
                      </p>
                    </div>
                    <span className="font-serif italic text-base font-bold text-cyan">
                      ~ {personalData.signature}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

            {/* Executive Leadership Section */}
      <section className="py-16 md:py-20 bg-navy border-t border-navy-border">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan-DEFAULT">
              EXECUTIVE LEADERSHIP & ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-1">
              Meet Spartan Impax Leadership
            </h2>
            <p className="text-sm sm:text-base text-navy-200 mt-2">
              Guided by seasoned technology leadership delivering mission-critical digital systems and Generative AI platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* CEO Card */}
            <div className="bg-navy-card p-8 rounded-3xl border border-navy-border hover:border-cyan-DEFAULT/50 shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy border border-navy-border text-cyan-DEFAULT">
                    CEO & Founder
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">
                  Gajender Singh Rajawat
                </h3>
                <p className="text-xs text-cyan-300 font-semibold mb-4">
                  Chief Executive Officer (CEO)
                </p>
                <p className="text-sm text-navy-200 leading-relaxed mb-6">
                  Guiding global client partnerships, strategic corporate vision, and high-yield technological delivery across North America, Europe, and Asia.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-border/60 flex items-center justify-between">
                <a
                  href="https://www.linkedin.com/in/gajender-singh-rajawat-859547430/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-DEFAULT hover:text-cyan-300 transition-colors"
                >
                  <LinkedinIcon size={16} />
                  <span>Connect on LinkedIn</span>
                </a>
                <a
                  href="mailto:gajender@spartanimpex.com"
                  className="text-xs text-silver-400 hover:text-white transition-colors"
                >
                  gajender@spartanimpex.com
                </a>
              </div>
            </div>

            {/* CIO Card */}
            <div className="bg-navy-card p-8 rounded-3xl border border-navy-border hover:border-cyan-DEFAULT/50 shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                    <GithubIcon size={24} className="text-cyan-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy border border-navy-border text-cyan-DEFAULT">
                    CIO & Principal Architect
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">
                  Usman
                </h3>
                <p className="text-xs text-cyan-300 font-semibold mb-4">
                  Chief Information Officer (CIO)
                </p>
                <p className="text-sm text-navy-200 leading-relaxed mb-6">
                  Principal software architect driving cloud infrastructure, Oracle APEX manufacturing ERP portals, Generative AI models, and scalable full-stack web applications.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-border/60 flex items-center justify-between gap-3">
                <a
                  href="https://www.linkedin.com/in/generalusman/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-DEFAULT hover:text-cyan-300 transition-colors"
                >
                  <LinkedinIcon size={16} />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://github.com/tzkusman/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-silver-300 hover:text-white transition-colors"
                >
                  <GithubIcon size={16} />
                  <span>github.com/tzkusman</span>
                </a>
              </div>
            </div>
          </div>

          {/* Corporate Channels & Verified Presence */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl bg-navy-card border border-navy-border max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <span>Official Corporate Channels</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT animate-pulse" />
                </h4>
                <p className="text-xs text-navy-200 mt-0.5">
                  Follow Spartan Impex IT Services for enterprise updates, case studies, and engineering culture.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={personalData.socials.companyLinkedin || "https://www.linkedin.com/company/spartan-impex-it-services/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Spartan Impex IT Services on LinkedIn (Company Page)"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-xs font-semibold text-silver-200 hover:text-cyan-DEFAULT hover:border-cyan-DEFAULT/60 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all duration-300"
              >
                <LinkedinIcon size={16} />
                <span>LinkedIn Company Page</span>
              </a>
              <a
                href={personalData.socials.instagram || "https://www.instagram.com/spartanimpex/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Spartan Impex on Instagram (@spartanimpex)"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-xs font-semibold text-silver-200 hover:text-pink-400 hover:border-pink-500/60 hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] transition-all duration-300"
              >
                <InstagramIcon size={16} />
                <span>Instagram @spartanimpex</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* My Journey Timeline Section */}
      <section className="py-16 md:py-20 bg-navy-card border-y border-navy-border">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan">
              CAREER & ACADEMIA
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-1">
              My Professional Journey
            </h2>
            <p className="text-sm sm:text-base text-navy-200 mt-2">
              A chronological overview of education, career milestones, and ongoing engineering objectives.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {personalData.journey.map((item, idx) => {
              const IconComp = journeyIcons[item.type] || Briefcase;

              return (
                <div
                  key={idx}
                  className="bg-navy p-6 sm:p-8 rounded-2xl border border-navy-border hover:border-cyan-500/50 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start group"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300">
                    <IconComp size={22} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <h3 className="font-serif text-xl font-medium text-white">
                        {item.role}
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-navy-card border border-navy-border text-cyan self-start sm:self-auto">
                        {item.period}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-navy-300 uppercase tracking-wider mb-3">
                      {item.institution}
                    </div>

                    <p className="text-sm text-navy-200 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Why Me? Section */}
      <section className="py-16 md:py-20 bg-navy">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan">
              CORE ADVANTAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-1">
              Why Work With Me?
            </h2>
            <p className="text-sm sm:text-base text-navy-200 mt-2">
              Values, mindset, and strengths applied to every product engineering engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalData.whyMe.map((item) => (
              <div
                key={item.id}
                className="bg-navy-card p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col group"
              >
                <div className="w-10 h-10 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300">
                  <CheckCircle size={20} />
                </div>
                <h3 className="font-serif text-lg font-medium text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-navy-200 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Resume Download CTA Section */}
      <section className="py-12 bg-navy-card border-t border-navy-border">
        <Container>
          <div className="bg-navy p-8 sm:p-10 rounded-3xl border border-navy-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan">
                OFFICIAL PRESENTATION
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white mt-1">
                Download Official Company Portfolio
              </h3>
              <p className="text-sm text-navy-200 mt-1">
                Comprehensive enterprise overview covering engineering philosophy, leadership, 10 core service disciplines, and client case studies.
              </p>
            </div>
            <Button
              href={personalData.resumeUrl}
              download="Spartan-Impex-Company-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
              icon={Download}
              iconPosition="left"
            >
              Download Presentation (PDF)
            </Button>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </div>
  );
}
