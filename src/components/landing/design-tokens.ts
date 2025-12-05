/**
 * Premium Fintech Design System
 * Inspired by: Robinhood, Public.com, Finary, Koyfin
 *
 * Design Principles:
 * - Confident, calm, modern, professional
 * - Investor-grade visual density
 * - Premium spacing with 25-35% more negative space
 * - Glassmorphism with soft blur and shadows
 * - Large, elegant typography
 */

export const tokens = {
  // Color Palette - Calm, Premium, Professional
  colors: {
    // Backgrounds - Deep, luxurious darks
    bg: {
      primary: '#030508',      // Near-black, premium base
      secondary: '#060A10',    // Slightly lighter for sections
      tertiary: '#0A0F18',     // Card backgrounds
      elevated: '#0E1420',     // Elevated surfaces
      glass: 'rgba(255, 255, 255, 0.02)',
      glassHover: 'rgba(255, 255, 255, 0.04)',
    },

    // Accent colors - Sophisticated, muted tones
    accent: {
      primary: '#5B7CFF',      // Soft indigo - primary brand
      secondary: '#00C9E4',    // Cyan - secondary accent
      tertiary: '#8B5CF6',     // Violet - tertiary
      success: '#22C55E',      // Emerald - positive
      warning: '#F59E0B',      // Amber - warning
      danger: '#EF4444',       // Rose - negative
      gold: '#FFD700',         // Premium gold
    },

    // Text colors - Refined hierarchy
    text: {
      primary: '#FFFFFF',      // Pure white for headlines
      secondary: '#E2E8F0',    // Light gray for body
      tertiary: '#94A3B8',     // Muted gray
      muted: '#64748B',        // Subdued
      disabled: '#475569',     // Disabled state
    },

    // Border colors - Subtle, elegant
    border: {
      subtle: 'rgba(255, 255, 255, 0.03)',
      default: 'rgba(255, 255, 255, 0.06)',
      hover: 'rgba(255, 255, 255, 0.12)',
      accent: 'rgba(91, 124, 255, 0.25)',
      glow: 'rgba(0, 201, 228, 0.20)',
    },

    // Gradient presets
    gradients: {
      primary: 'linear-gradient(135deg, #5B7CFF 0%, #00C9E4 100%)',
      accent: 'linear-gradient(135deg, #00C9E4 0%, #8B5CF6 100%)',
      hero: 'linear-gradient(180deg, rgba(91, 124, 255, 0.08) 0%, rgba(0, 201, 228, 0.04) 50%, transparent 100%)',
      card: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      glow: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 124, 255, 0.15), transparent)',
    }
  },

  // Spacing Scale - Premium, generous spacing (4px base)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    40: '160px',
  },

  // Typography - HIG-inspired, elegant
  typography: {
    fonts: {
      display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
    },

    // Font sizes - Large, confident
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    leading: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.65,
    },

    tracking: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Border Radius - Soft, premium
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // Shadows - Deep, luxurious
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.25)',
    '2xl': '0 24px 64px rgba(0, 0, 0, 0.3)',
    glow: {
      primary: '0 0 60px rgba(91, 124, 255, 0.15)',
      secondary: '0 0 60px rgba(0, 201, 228, 0.12)',
      success: '0 0 60px rgba(34, 211, 153, 0.12)',
      card: '0 20px 50px rgba(0, 0, 0, 0.35)',
    },
  },

  // Glassmorphism - Premium glass effects
  glass: {
    background: 'rgba(255, 255, 255, 0.02)',
    backgroundHover: 'rgba(255, 255, 255, 0.04)',
    blur: '16px',
    blurStrong: '24px',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.10)',
  },

  // Transitions - Smooth, elegant
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
  },
} as const

// Tailwind-compatible class strings for common patterns
export const classes = {
  // Premium glass card
  glassCard: `
    relative rounded-2xl
    bg-gradient-to-b from-white/[0.03] to-white/[0.01]
    border border-white/[0.06]
    backdrop-blur-xl
    shadow-[0_20px_50px_rgba(0,0,0,0.35)]
  `,

  // Premium card with depth and hover
  premiumCard: `
    relative rounded-2xl
    bg-gradient-to-b from-white/[0.04] to-white/[0.01]
    border border-white/[0.06]
    backdrop-blur-xl
    shadow-[0_16px_40px_rgba(0,0,0,0.3)]
    transition-all duration-300
    hover:border-white/[0.12]
    hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]
  `,

  // Feature card with glow
  featureCard: `
    relative rounded-2xl
    bg-gradient-to-b from-white/[0.03] to-transparent
    border border-white/[0.06]
    backdrop-blur-sm
    transition-all duration-500
    hover:border-white/[0.1]
    hover:shadow-[0_20px_50px_rgba(91,124,255,0.08)]
  `,

  // Headlines
  headlineHero: `
    text-5xl md:text-6xl lg:text-7xl
    font-semibold tracking-tight
    leading-[1.08]
  `,

  headlineXL: `
    text-4xl md:text-5xl lg:text-6xl
    font-semibold tracking-tight
    leading-[1.1]
  `,

  headlineLG: `
    text-3xl md:text-4xl lg:text-5xl
    font-semibold tracking-tight
    leading-[1.15]
  `,

  headlineMD: `
    text-2xl md:text-3xl
    font-medium tracking-tight
    leading-[1.2]
  `,

  headlineSM: `
    text-xl md:text-2xl
    font-medium tracking-tight
    leading-[1.25]
  `,

  // Body text
  bodyLG: `
    text-lg md:text-xl
    font-light
    leading-[1.6]
    tracking-normal
  `,

  bodyMD: `
    text-base md:text-lg
    font-normal
    leading-[1.55]
  `,

  bodySM: `
    text-sm md:text-base
    font-normal
    leading-[1.5]
  `,

  // Labels
  label: `
    text-xs
    font-medium
    uppercase
    tracking-[0.1em]
  `,

  // Buttons
  buttonPrimary: `
    inline-flex items-center justify-center gap-2.5
    px-7 py-3.5
    rounded-xl
    bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4]
    text-white text-sm font-semibold
    transition-all duration-300
    hover:shadow-[0_0_40px_rgba(91,124,255,0.35)]
    hover:scale-[1.02]
    active:scale-[0.98]
  `,

  buttonSecondary: `
    inline-flex items-center justify-center gap-2.5
    px-7 py-3.5
    rounded-xl
    bg-white/[0.03]
    border border-white/[0.08]
    text-white text-sm font-semibold
    backdrop-blur-sm
    transition-all duration-300
    hover:bg-white/[0.06]
    hover:border-white/[0.15]
  `,

  // Section spacing
  sectionPadding: `py-24 md:py-32 lg:py-40`,
  sectionPaddingLG: `py-32 md:py-40 lg:py-48`,

  // Container
  container: `mx-auto max-w-7xl px-6 lg:px-8`,
  containerWide: `mx-auto max-w-[1400px] px-6 lg:px-8`,
}

// Animation keyframes for use with Tailwind
export const animations = {
  fadeIn: 'animate-[fadeIn_0.5s_ease-out_forwards]',
  fadeUp: 'animate-[fadeUp_0.6s_ease-out_forwards]',
  scaleIn: 'animate-[scaleIn_0.5s_ease-out_forwards]',
  pulse: 'animate-[pulse_2s_ease-in-out_infinite]',
  shimmer: 'animate-[shimmer_2s_ease-in-out_infinite]',
}
