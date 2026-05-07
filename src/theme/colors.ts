export const Colors = {
  // Core brand
  primary: '#6C63FF',
  primaryDark: '#4B44CC',
  primaryLight: '#8B85FF',
  accent: '#00D4AA',
  accentDark: '#00A884',
  warning: '#FFB547',
  danger: '#FF5A5F',
  success: '#00D4AA',

  // Background layers
  bg0: '#0A0B14',   // deepest
  bg1: '#11131F',   // base bg
  bg2: '#181B2E',   // card bg
  bg3: '#1F2340',   // elevated card
  bg4: '#252A4A',   // input / subtle

  // Surface
  surface: '#1A1D30',
  surfaceHigh: '#222640',

  // Borders
  border: '#2A2E50',
  borderLight: '#353A60',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A8CC',
  textMuted: '#5C6285',
  textOnAccent: '#FFFFFF',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C63FF', '#4B44CC'] as string[],
  gradientAccent: ['#00D4AA', '#0097A7'] as string[],
  gradientCard: ['#1F2340', '#181B2E'] as string[],
  gradientDanger: ['#FF5A5F', '#D63A3F'] as string[],
  gradientWarning: ['#FFB547', '#E09030'] as string[],
  gradientBg: ['#0A0B14', '#11131F'] as string[],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};
