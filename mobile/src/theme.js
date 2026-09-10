// Design tokens mirrored from the web app (server/resources/css/app.css + Tailwind).
// Light: web :root. Dark: web .dark (stock shadcn zinc). Both palettes share keys.
// Web light --primary: 161 94% 30% => emerald-600 #059669.
export const lightColors = {
  background: '#f9fafb',      // bg-gray-50 (body)
  surfaceBase: '#ffffff',     // card / background
  surfaceRaised: '#ffffff',
  surfaceContainer: '#f3f4f6',// muted / gray-100
  surfaceMuted: '#f9fafb',
  primary: '#059669',         // emerald-600
  primaryForeground: '#ffffff',// on-primary text
  primaryHover: '#047857',    // emerald-700
  primarySoft: '#ecfdf5',     // emerald-50
  primarySoftBorder: '#a7f3d0',// emerald-200
  primaryText: '#065f46',     // emerald-800
  tertiary: '#4f46e5',
  textPrimary: '#111827',     // gray-900 (foreground)
  textSecondary: '#4b5563',   // gray-600
  textMuted: '#6b7280',       // gray-500 (muted-foreground)
  textFaint: '#9ca3af',       // gray-400
  statusSuccess: '#059669',
  statusSuccessBg: '#dcfce7',
  statusSuccessText: '#047857',
  statusWarning: '#d97706',   // amber-600
  statusWarningBg: '#fef3c7',
  statusWarningText: '#92400e',
  statusCritical: '#dc2626',  // red-600
  statusCriticalBg: '#fee2e2',
  statusCriticalText: '#b91c1c',
  // "Attention Required" warm block (dashboard) + accents that must flip in dark.
  attnBg: '#fff7ed',          // orange-50
  attnBorder: '#fed7aa',      // orange-200
  attnTitle: '#9a3412',       // orange-800
  attnIcon: '#c2410c',        // orange-700
  accentOrange: '#ea580c',    // orange-600 (stat value)
  accentOrangeIcon: '#f97316',// orange-500
  accentRedIcon: '#ef4444',   // red-500
  accentPurpleBg: '#f3e8ff',  // purple-100
  accentPurple: '#9333ea',    // purple-600
  border: '#e5e7eb',          // gray-200 (border/input)
  borderSubtle: '#e5e7eb',
  borderStrong: '#d1d5db',    // gray-300
  gridLine: '#f3f4f6',
  chartBar: '#4FDBC8',        // matches web recharts Bar fill
  destructive: '#dc2626',
  overlay: 'rgba(0,0,0,0.5)',
};

// Web .dark tokens (240 10% 3.9% background, 0 0% 98% foreground, zinc borders).
// Primary mirrors web .dark literally: near-white with dark text.
export const darkColors = {
  background: '#09090b',      // --background 240 10% 3.9%
  surfaceBase: '#18181b',     // card raised for separation from bg
  surfaceRaised: '#1f1f23',
  surfaceContainer: '#27272a',// --muted 240 3.7% 15.9%
  surfaceMuted: '#131316',
  primary: '#fafafa',         // --primary 0 0% 98%
  primaryForeground: '#18181b',// --primary-foreground 240 5.9% 10%
  primaryHover: '#e4e4e7',
  primarySoft: '#052e24',     // deep emerald tint for soft accents
  primarySoftBorder: '#0f5132',
  primaryText: '#6ee7b7',     // emerald-300 for readable emerald text on dark
  tertiary: '#818cf8',
  textPrimary: '#fafafa',     // --foreground 0 0% 98%
  textSecondary: '#d4d4d8',
  textMuted: '#a1a1aa',       // --muted-foreground 240 5% 64.9%
  textFaint: '#71717a',
  statusSuccess: '#34d399',
  statusSuccessBg: '#052e24',
  statusSuccessText: '#6ee7b7',
  statusWarning: '#fbbf24',   // amber-400 (lighter for dark)
  statusWarningBg: '#422006',
  statusWarningText: '#fcd34d',
  statusCritical: '#f87171',  // red-400
  statusCriticalBg: '#450a0a',
  statusCriticalText: '#fca5a5',
  attnBg: '#2a1a0a',
  attnBorder: '#7c2d12',
  attnTitle: '#fdba74',       // orange-300
  attnIcon: '#fb923c',        // orange-400
  accentOrange: '#fb923c',
  accentOrangeIcon: '#fb923c',
  accentRedIcon: '#f87171',
  accentPurpleBg: '#2e1065',
  accentPurple: '#c4b5fd',    // violet-300
  border: '#27272a',          // --border 240 3.7% 15.9%
  borderSubtle: '#27272a',
  borderStrong: '#3f3f46',
  gridLine: '#27272a',
  chartBar: '#4FDBC8',        // reads well on dark too
  destructive: '#b91c1c',     // --destructive 0 62.8% 30.6%
  overlay: 'rgba(0,0,0,0.7)',
};

// Fallback alias for any reference not yet reading from ThemeContext.
export const colors = lightColors;

// radius: web --radius: 0.5rem (8px). md = radius-2 (6px), sm = radius-4 (4px)
export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Inter font family names loaded via @expo-google-fonts/inter in App.js.
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Text style presets echoing the web's typographic scale.
export const fonts = {
  headlineLg: { fontFamily: font.bold, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 }, // text-3xl font-bold tracking-tight
  headlineMd: { fontFamily: font.bold, fontSize: 20, fontWeight: '700' },
  headlineSm: { fontFamily: font.semibold, fontSize: 16, fontWeight: '600' },
  title: { fontFamily: font.semibold, fontSize: 16, fontWeight: '600' },
  bodyMd: { fontFamily: font.regular, fontSize: 14, fontWeight: '400' },
  bodySm: { fontFamily: font.regular, fontSize: 12, fontWeight: '400' },
  mediumMd: { fontFamily: font.medium, fontSize: 14, fontWeight: '500' },
  semiSm: { fontFamily: font.semibold, fontSize: 14, fontWeight: '600' },
  labelSm: { fontFamily: font.semibold, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  labelMd: { fontFamily: font.medium, fontSize: 12, fontWeight: '500' },
  tabularLg: { fontFamily: font.bold, fontSize: 24, fontWeight: '700' },
};
