import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    // AdminLayout puts a `dark` class on its root element. Without this the
    // default "media" strategy is used, so every dark: variant keyed off the
    // OS setting instead of that class.
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                'label-sm': ['Geist'],
                'label-lg': ['Space Grotesk'],
                'headline-sm': ['Space Grotesk'],
                'headline-md': ['Space Grotesk'],
                'headline-lg': ['Space Grotesk'],
                'body-sm': ['Geist'],
                'body-md': ['Geist'],
                'data-tabular-md': ['Geist'],
                'data-tabular-lg': ['Space Grotesk']
            },
            colors: {
                'surface-base': '#06090C',
                'surface-raised': '#0E1318',
                'surface-overlay': '#161D24',
                'surface-container': '#1c2024',
                'surface-container-low': '#181c20',
                'surface-container-high': '#262a2f',
                'surface-container-highest': '#31353a',
                'primary': '#4fdbc8',
                // Used as `text-on-primary` on filled primary buttons; the
                // palette never defined it, so that text stayed unstyled.
                'on-primary': '#00201C',
                // `hover:bg-primary-hover` is on the main action button of seven
                // pages (products, users, suppliers, categories, purchasing,
                // reports, login) but was never defined, so none of those
                // buttons had a hover state at all. Brightened rather than
                // darkened: these sit on a near-black surface.
                'primary-hover': '#6fe3d3',
                'tertiary': '#3cddc7',
                'secondary-container': '#007068',
                'border-subtle': '#1E2730',
                'border-strong': '#2C3946',
                'outline': '#859490',
                'outline-variant': '#3c4947',
                'text-primary': '#F1F5F9',
                'text-secondary': '#94A3B8',
                'text-muted': '#64748B',
                'on-surface': '#e0e3e8',
                'on-surface-variant': '#bbcac6',
                'status-success': '#16A34A',
                'status-success-bg': '#062312',
                'status-critical': '#E11D48',
                'status-critical-bg': '#2A0A12',
                'status-warning': '#F59E0B',
                'status-warning-bg': '#2B1A04',
                // Used for the Rx / informational badges on the product,
                // report and adjustment tables; the palette never defined it,
                // so those badges rendered with no colour at all.
                'status-info': '#3B82F6',
                'status-info-bg': '#0A192E',
                'badge-controlled-text': '#FFE4E6',
                'badge-controlled': '#BE123C'
            },
            spacing: {
                // gap-2xs is referenced by AdminLayout but was never defined.
                'gap-2xs': '0.125rem',
                'gap-xs': '0.25rem',
                'gap-sm': '0.5rem',
                'gap-md': '0.75rem',
                'gap-lg': '1rem',
                'gutter-mobile': '0.75rem'
            },
            fontSize: {
                'label-sm': ['9px', { lineHeight: '12px', letterSpacing: '0.06em', fontWeight: '600' }],
                'label-lg': ['13px', { lineHeight: '16px', letterSpacing: '0.03em', fontWeight: '600' }],
                'body-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '400' }],
                'body-md': ['13px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '400' }],
                'headline-sm': ['15px', { lineHeight: '20px', fontWeight: '600' }],
                'headline-md': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
                'headline-lg': ['24px', { lineHeight: '30px', letterSpacing: '-0.02em', fontWeight: '700' }],
                'data-tabular-md': ['13px', { lineHeight: '16px', letterSpacing: '-0.01em', fontWeight: '500' }],
                'data-tabular-lg': ['20px', { lineHeight: '24px', letterSpacing: '-0.03em', fontWeight: '700' }]
            }
        },
    },

    plugins: [forms],
};
