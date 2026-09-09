interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 'md', showSubtitle = true, variant = 'light', className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Badge Icon inspired by official logo (mountain, landslide, river, satellite orbit) */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} rounded-full overflow-hidden shadow-sm border ${isDark ? 'border-emerald-500/30' : 'border-[#1b4d3e]/20'} bg-[#0b3d2e] p-0.5`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#0b382c" />
          
          {/* Orbital path arc */}
          <ellipse cx="50" cy="50" rx="42" ry="42" stroke="url(#orbitGradient)" strokeWidth="2.5" strokeDasharray="60 30" transform="rotate(-30 50 50)" />
          
          {/* Mountain background peak */}
          <polygon points="18,65 42,22 68,65" fill="#134e3f" />
          
          {/* Mountain foreground slope with landslide scarp */}
          <polygon points="32,70 52,26 84,72" fill="#1a5f4c" />
          <polygon points="52,26 62,48 55,62 44,52" fill="#2d7a64" />
          
          {/* Rockfall debris stones falling down slope */}
          <rect x="56" y="38" width="5" height="4" rx="1" fill="#c2a275" transform="rotate(15 56 38)" />
          <rect x="62" y="47" width="6" height="5" rx="1.5" fill="#a88556" transform="rotate(-20 62 47)" />
          <rect x="58" y="56" width="7" height="6" rx="1.5" fill="#c2a275" transform="rotate(10 58 56)" />
          <rect x="68" y="58" width="6" height="5" rx="1" fill="#8f6c3e" transform="rotate(-15 68 58)" />

          {/* Green foothills & trees */}
          <path d="M10,74 Q30,62 55,74 Q80,82 90,75 L90,95 L10,95 Z" fill="#0e4435" />
          {/* Pine trees silhouettes */}
          <polygon points="20,72 23,65 26,72" fill="#082b21" />
          <polygon points="24,73 27,63 30,73" fill="#082b21" />
          <polygon points="28,74 31,66 34,74" fill="#082b21" />

          {/* Curving valley river */}
          <path d="M38,98 C46,84 48,78 58,74 C68,70 76,68 86,66 L86,72 C76,74 68,77 56,82 C44,88 40,98 40,98 Z" fill="#7dd3fc" />

          {/* Orbiting Earth-observation satellite */}
          <g transform="translate(68, 14) rotate(42)">
            {/* Satellite body */}
            <rect x="0" y="3" width="9" height="7" rx="1" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
            {/* Solar panels */}
            <rect x="-7" y="4.5" width="6" height="4" rx="0.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
            <rect x="10" y="4.5" width="6" height="4" rx="0.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
            {/* Sensor beam waves */}
            <path d="M4.5,11 Q0,14 -3,18" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
            <path d="M4.5,11 Q4.5,15 4.5,19" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          </g>

          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${titleSizes[size]} ${isDark ? 'text-white' : 'text-[#003629]'} font-extrabold tracking-tight flex items-center`}>
            Bhoomi
            <span className="text-[#1b4d3e] dark:text-[#32c98f] flex items-center">
              R
              <span className="relative inline-flex items-center justify-center mx-[0.5px]">
                {/* Stylized Mountain Chevron A */}
                <span className="font-extrabold">A</span>
                <span className="absolute bottom-[2px] w-[6px] h-[3px] bg-amber-500 rounded-sm"></span>
              </span>
              kshak
            </span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
            RISK INTELLIGENCE
          </span>
        </div>

        {showSubtitle && (
          <span className={`text-[11px] font-medium tracking-tight mt-0.5 ${isDark ? 'text-emerald-300/80' : 'text-[#404945]'}`}>
            Live Data • Assess • Protect
          </span>
        )}
      </div>
    </div>
  );
}
