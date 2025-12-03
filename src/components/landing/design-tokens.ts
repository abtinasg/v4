/**
 * Premium Fintech Design System
 * Inspired by: Robinhood, Public.com, Finary, Koyfin
 */

export const tokens = {
  // Color Palette - Calm, Premium, Professional
  colors: {
    // Backgrounds
    bg: {
      primary: '#030407',      // Near-black, premium base
      secondary: '#070A0F',    // Slightly lighter for cards
      tertiary: '#0C1017',     // Card hover states
      elevated: '#101419',     // Elevated surfaces
    },
    
    // Accent colors - Muted, sophisticated
    accent: {
      primary: '#6366F1',      // Indigo - primary brand
      secondary: '#22D3EE',    // Cyan - secondary accent
      success: '#34D399',      // Emerald - positive
      warning: '#FBBF24',      // Amber - warning
      danger: '#F87171',       // Rose - negative
    },
    
    // Text colors
    text: {
      primary: '#F8FAFC',      // Near-white
      secondary: '#94A3B8',    // Muted gray
      tertiary: '#64748B',     // Subdued
      muted: '#475569',        // Very muted
      disabled: '#334155',     // Disabled state
    },
    
    // Border colors
    border: {
      subtle: 'rgba(255, 255, 255, 0.04)',
      default: 'rgba(255, 255, 255, 0.06)',
      hover: 'rgba(255, 255, 255, 0.10)',
      accent: 'rgba(99, 102, 241, 0.20)',
    },
  },
  
  // Spacing Scale - 4px base
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
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },
  
  // Typography
  typography: {
    // Font families
    fonts: {
      display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", monospace',
    },
    
    // Font sizes
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
    },
    
    // Font weights
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    // Line heights
    leading: {
      tight: 1.1,
      snug: 1.25,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.65,
    },
    
    // Letter spacing
    tracking: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },
  
  // Border Radius
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },
  
  // Shadows - Soft, premium
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: {
      primary: '0 0 40px rgba(99, 102, 241, 0.15)',
      secondary: '0 0 40px rgba(34, 211, 238, 0.12)',
      success: '0 0 40px rgba(52, 211, 153, 0.12)',
    },
  },
  
  // Glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.02)',
    backgroundHover: 'rgba(255, 255, 255, 0.04)',
    blur: '12px',
    border: 'rgba(255, 255, 255, 0.06)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    smooth: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
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

// Tailwind-compatible class strings
export const classes = {
  // Glass card base
  glassCard: `
    relative rounded-2xl 
    bg-[rgba(255,255,255,0.02)] 
    border border-[rgba(255,255,255,0.06)]
    backdrop-blur-xl
    shadow-[0_8px_32px_rgba(0,0,0,0.12)]
  `,
  
  // Premium card with depth
  premiumCard: `
    relative rounded-2xl
    bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)]
    border border-[rgba(255,255,255,0.06)]
    shadow-[0_12px_40px_rgba(0,0,0,0.15)]
  `,
  
  // Headline styles
  headlineXL: `
    text-5xl md:text-6xl lg:text-7xl 
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
  
  // Body text
  bodyLG: `
    text-lg md:text-xl 
    font-light 
    leading-[1.5] 
    tracking-normal
  `,
  
  bodyMD: `
    text-base 
    font-normal 
    leading-[1.5]
  `,
  
  bodySM: `
    text-sm 
    font-normal 
    leading-[1.5]
  `,
  
  // Label
  label: `
    text-xs 
    font-medium 
    uppercase 
    tracking-wider
  `,
  
  // Buttons
  buttonPrimary: `
    inline-flex items-center justify-center gap-2
    px-6 py-3 
    rounded-xl 
    bg-[#6366F1] 
    text-white text-sm font-medium
    transition-all duration-200
    hover:bg-[#5457E5] 
    hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]
  `,
  
  buttonSecondary: `
    inline-flex items-center justify-center gap-2
    px-6 py-3 
    rounded-xl 
    bg-[rgba(255,255,255,0.04)]
    border border-[rgba(255,255,255,0.08)]
    text-white text-sm font-medium
    transition-all duration-200
    hover:bg-[rgba(255,255,255,0.06)]
    hover:border-[rgba(255,255,255,0.12)]
  `,
}
