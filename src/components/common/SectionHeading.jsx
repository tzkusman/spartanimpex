import React from 'react';

export default function SectionHeading({
  subtitle,
  title,
  description,
  align = 'left',
  className = '',
  badge = null
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col mb-10 md:mb-14 ${alignClass} ${className}`}>
      {badge && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-navy-muted text-cyan-400 border border-cyan-500/30 mb-3 tracking-wide">
          {badge}
        </span>
      )}

      {subtitle && (
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-[1.5px] bg-cyan-500" />
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400">
            {subtitle}
          </span>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-white leading-tight">
        {title}
      </h2>

      {description && (
        <p className={`mt-3 text-base sm:text-lg text-navy-200 font-normal leading-relaxed max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
}
