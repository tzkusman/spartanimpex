import React from 'react';
import { 
  Globe, 
  Smartphone, 
  Cloud, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { servicesData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import CtaBanner from '../components/home/CtaBanner';

const serviceIcons = {
  Globe,
  Smartphone,
  Cloud,
  Database,
  ShieldCheck,
  Workflow
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge="SOLUTIONS & CONSULTING"
        title="Services & Offerings"
        description="Bespoke engineering capabilities tailored to enterprise growth, security, and digital transformation."
        breadcrumbs={[{ label: 'Services' }]}
      />

      <section className="py-12 md:py-20 bg-navy">
        <Container>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {servicesData.map((service) => {
              const IconComp = serviceIcons[service.icon] || Globe;

              return (
                <div
                  key={service.id}
                  className="group bg-navy-card p-8 rounded-3xl border border-navy-border hover:border-cyan-500/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top icon and header */}
                    <div className="w-14 h-14 rounded-2xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300">
                      <IconComp size={26} />
                    </div>

                    <h2 className="font-serif text-2xl font-medium text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h2>

                    <p className="text-sm text-navy-200 leading-relaxed mb-6">
                      {service.shortDesc}
                    </p>

                    {/* Features list */}
                    <div className="pt-4 border-t border-navy-border">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-300 mb-3">
                        Key Deliverables
                      </h3>
                      <ul className="space-y-2">
                        {service.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-navy-200">
                            <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-navy-border">
                    <Button
                      to={`/contact?service=${encodeURIComponent(service.title)}`}
                      variant="secondary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full text-xs font-medium"
                    >
                      Inquire About This Service
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need a Custom Solution banner */}
          <div className="bg-navy-dark text-white rounded-3xl p-8 sm:p-12 border border-navy-border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-widest font-semibold mb-2">
                <Sparkles size={14} />
                <span>BESPOKE ENGINEERING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-white mb-2">
                Need a Custom Solution?
              </h2>
              <p className="text-sm sm:text-base text-navy-200 max-w-xl">
                Have specific enterprise requirements, legacy systems to refactor, or complex cloud architectures to deploy? Let's discuss your timeline and technical scope.
              </p>
            </div>
            <Button
              to="/contact"
              variant="primary"
              size="lg"
              className="flex-shrink-0 font-semibold"
            >
              Request Custom Proposal
            </Button>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </div>
  );
}
