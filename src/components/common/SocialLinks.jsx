import React from 'react';
import { Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons';
import { personalData } from '../../data/portfolioData';

export default function SocialLinks({ className = '', iconSize = 18, variant = 'minimal' }) {
  const links = [
    {
      name: 'GitHub (tzkusman)',
      href: personalData.socials.github || 'https://github.com/tzkusman/',
      icon: GithubIcon,
      label: 'GitHub',
    },
    {
      name: 'CEO LinkedIn (Gajender Singh Rajawat)',
      href: personalData.socials.linkedin || 'https://www.linkedin.com/in/gajender-singh-rajawat-859547430/',
      icon: LinkedinIcon,
      label: 'CEO LinkedIn',
    },
    {
      name: 'CIO LinkedIn (Usman)',
      href: personalData.socials.cioLinkedin || 'https://www.linkedin.com/in/generalusman/',
      icon: LinkedinIcon,
      label: 'CIO LinkedIn',
    },
    {
      name: 'Corporate Inquiries',
      href: personalData.socials.email || 'mailto:gajender@spartanimpex.com',
      icon: Mail,
      label: 'Email',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map((link) => {
        const IconComponent = link.icon;

        if (variant === 'circle') {
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.name}
              aria-label={link.name}
              className="w-10 h-10 rounded-xl bg-navy-card border border-navy-border flex items-center justify-center text-silver-300 hover:text-cyan-DEFAULT hover:border-cyan-DEFAULT hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:scale-105 transition-all duration-300"
            >
              <IconComponent size={iconSize} />
            </a>
          );
        }

        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.name}
            aria-label={link.name}
            className="p-2 text-silver-400 hover:text-cyan-DEFAULT transition-colors duration-200"
          >
            <IconComponent size={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
