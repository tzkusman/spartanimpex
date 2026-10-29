import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeSeoMap = {
  '/': {
    title: 'Spartan Impex — Enterprise IT Architecture, Cloud & Software Engineering',
    description: 'Spartan Impex architects mission-critical digital systems, scalable cloud platforms, Oracle APEX cloud migrations, and Generative AI pipelines for global companies.',
    keywords: 'Enterprise IT, Cloud Architecture, Full Stack Developer, React, Node.js, Next.js, AI Integration, Spartan Impex, Spartan Impex',
  },
  '/about': {
    title: 'About Spartan Impex — 6+ Years Enterprise IT & Digital Engineering',
    description: 'Learn about Spartan Impex leadership, technology philosophy, client track record, and engineering excellence led by CEO Gajender Singh Rajawat.',
    keywords: 'About Spartan Impex, Gajender Singh Rajawat, IT Leadership, Enterprise Software Consultancy, Engineering Team',
  },
  '/services': {
    title: 'IT Services & Cloud Architecture Solutions — Spartan Impex',
    description: 'Explore 10 bespoke enterprise services: Full-Stack Engineering, Cloud/DevOps, AI Automation, Database Optimization, Cybersecurity, and Custom ERP Systems.',
    keywords: 'IT Services, Full-Stack Engineering, Cloud Migration, Oracle APEX, AI Pipelines, Cybersecurity Audit, Database Design',
  },
  '/pricing': {
    title: 'Architecture Retainers & Transparent Pricing — Spartan Impex',
    description: 'Transparent investment packages for enterprise IT architecture: Starter Architecture (₹14,999), Business Platform (₹49,999), and Enterprise Custom Retainers.',
    keywords: 'IT Pricing, Architecture Retainer, Software Development Cost, Web App Development Packages, Enterprise Retainers',
  },
  '/projects': {
    title: 'Featured Projects & Enterprise Case Studies — Spartan Impex',
    description: 'Case studies of mission-critical production systems built by Spartan Impex: BLEACH RESISTANT ERP, DenimCrafts International, AI Medical Diagnostics, and Fintech platforms.',
    keywords: 'Case Studies, Software Portfolio, Enterprise ERP, AI Projects, Full Stack Applications, Spartan Impex Portfolio',
  },
  '/skills': {
    title: 'Technical Expertise & Engineering Stack — Spartan Impex',
    description: 'Comprehensive technical skills directory across Frontend, Backend, Databases, Cloud & DevOps, Security, and Artificial Intelligence.',
    keywords: 'Technical Stack, React 19, Node.js, Python, PostgreSQL, Prisma, AWS, Docker, Kubernetes, Oracle APEX',
  },
  '/blog': {
    title: 'Engineering Journal & Architecture Insights — Spartan Impex',
    description: 'Deep technical articles, microservices guides, database scaling strategies, and architectural best practices from the Spartan Impex engineering team.',
    keywords: 'IT Blog, Software Engineering Articles, Microservices Architecture, Cloud Scaling, Tech Insights',
  },
  '/contact': {
    title: 'Contact Spartan Impex — Schedule Architecture Consultation',
    description: 'Direct inquiry channel for enterprise contracts, architecture reviews, and project onboarding with CEO Gajender Singh and the Spartan Impex engineering squad.',
    keywords: 'Contact Spartan Impex, Hire Software Architect, IT Consultation, Enterprise Quote, Bangalore IT Team',
  },
};

export default function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const isProjectDetail = path.startsWith('/projects/') && path !== '/projects';
    const isBlogDetail = path.startsWith('/blog/') && path !== '/blog';

    let meta = routeSeoMap[path] || {
      title: 'Spartan Impex — Enterprise IT Architecture & Software Engineering',
      description: 'Spartan Impex delivers mission-critical enterprise IT architecture, bespoke web platforms, and Generative AI systems.',
      keywords: 'Spartan Impex, IT Architecture, Full Stack Developer',
    };

    if (isProjectDetail) {
      const slug = path.split('/')[2];
      const formatted = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      meta = {
        title: `${formatted} Case Study — Spartan Impex Enterprise IT`,
        description: `In-depth architectural breakdown, problem analysis, and technology stack for ${formatted}.`,
        keywords: `${formatted}, Case Study, Enterprise IT, Spartan Impex`,
      };
    } else if (isBlogDetail) {
      const slug = path.split('/')[2];
      const formatted = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      meta = {
        title: `${formatted} — Spartan Impex Engineering Journal`,
        description: `Deep technical breakdown and architecture insights on ${formatted}.`,
        keywords: `${formatted}, Engineering Journal, Tech Blog, Spartan Impex`,
      };
    }

    // Update Document Title
    document.title = meta.title;

    // Helper to update or create meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'keywords', meta.keywords);
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('property', 'og:url', `https://www.spartanimpex.com${path}`);
    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.description);

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://www.spartanimpex.com${path === '/' ? '' : path}`);

  }, [location]);

  return null;
}
