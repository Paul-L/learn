export type IconName =
  | 'volume'
  | 'volume-sm'
  | 'play'
  | 'flame'
  | 'check'
  | 'check-circle'
  | 'x'
  | 'x-circle'
  | 'arrow-left'
  | 'arrow-right'
  | 'home'
  | 'chart'
  | 'target'
  | 'refresh'
  | 'sparkle'
  | 'book'
  | 'lock'
  | 'chevron-right'
  | 'chevron-down'
  | 'dot'
  | 'coffee'
  | 'zap'
  | 'wave'
  | 'settings';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}

export function Icon({ name, size = 20, stroke = 1.75, className = '' }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (name) {
    case 'volume':
      return (
        <svg {...props}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    case 'volume-sm':
      return (
        <svg {...props}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    case 'play':
      return (
        <svg {...props}>
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      );
    case 'flame':
      return (
        <svg {...props}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.66 0 3-1.34 3-3 0-1.7-1-3-2-4-2 2-4 3-4 4.5z" />
          <path d="M12 2c1 2 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 3-7 1 1 1 2 2 4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <polyline points="4 12 10 18 20 6" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      );
    case 'x':
      return (
        <svg {...props}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      );
    case 'x-circle':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...props}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M3 20h18" />
          <path d="M6 16v-5" />
          <path d="M11 16V8" />
          <path d="M16 16v-3" />
          <path d="M21 16V5" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...props}>
          <polyline points="21 4 21 10 15 10" />
          <polyline points="3 20 3 14 9 14" />
          <path d="M20 10a8 8 0 0 0-14.5-2" />
          <path d="M4 14a8 8 0 0 0 14.5 2" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M5.6 5.6l2.8 2.8" />
          <path d="M15.6 15.6l2.8 2.8" />
          <path d="M5.6 18.4l2.8-2.8" />
          <path d="M15.6 8.4l2.8-2.8" />
        </svg>
      );
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 4h7a3 3 0 0 1 3 3v13" />
          <path d="M20 4h-7a3 3 0 0 0-3 3v13" />
          <path d="M4 4v16h16V4" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...props}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...props}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'dot':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'coffee':
      return (
        <svg {...props}>
          <path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
          <path d="M17 10h2a2 2 0 0 1 0 4h-2" />
          <path d="M7 4v2" />
          <path d="M11 4v2" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...props}>
          <path d="M2 12c2 0 2-4 4-4s2 8 4 8 2-8 4-8 2 4 4 4 2-2 4-2" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
  }
}
