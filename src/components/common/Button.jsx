import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs tracking-wide",
    md: "px-6 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-base tracking-wide shadow-sm",
  };

  const variantStyles = {
    primary:    "bg-cyan-500 hover:bg-cyan-400 text-navy font-semibold shadow-sm hover:shadow-cyan-glow focus:ring-cyan-400 border border-cyan-400/30",
    secondary:  "bg-navy-card hover:bg-navy-muted text-navy-100 border border-navy-border hover:border-cyan-500/50 focus:ring-cyan-500/30 shadow-card hover:shadow",
    dark:       "bg-navy-dark hover:bg-navy text-white border border-navy-border focus:ring-cyan-500 shadow-sm",
    ghost:      "bg-transparent hover:bg-navy-card/60 text-navy-100 hover:text-white",
    outlineGold:"bg-transparent hover:bg-gold/10 text-gold hover:text-gold-400 border border-gold/60 hover:border-gold",
    outlineCyan:"bg-transparent hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 border border-cyan-500/60 hover:border-cyan-400",
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-0.5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${combinedStyles}`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`group ${combinedStyles}`} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`group ${combinedStyles}`} {...props}>
      {content}
    </button>
  );
}
