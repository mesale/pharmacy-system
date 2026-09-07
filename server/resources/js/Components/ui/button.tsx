import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * This component previously targeted Tailwind 4 and shadcn's semantic palette
 * (bg-background, text-primary-foreground, ring-3, in-data-[...]), none of
 * which exist in this project: it runs Tailwind 3 with the bespoke dark
 * palette in tailwind.config.js. It also imported a `cn` package and
 * `@base-ui/react`, neither of which is installed, so the build failed before
 * any styling mattered. It is now a plain button styled with the tokens the
 * rest of the UI actually uses.
 */
const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-gap-xs whitespace-nowrap ' +
        'font-bold uppercase tracking-wider transition-colors border ' +
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ' +
        'disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-on-primary border-primary hover:bg-primary-hover hover:border-primary-hover',
                outline:
                    'bg-surface-overlay text-text-primary border-border-strong hover:border-primary hover:text-primary',
                secondary:
                    'bg-surface-container text-on-surface border-border-subtle hover:bg-surface-container-high',
                destructive:
                    'bg-status-critical-bg text-status-critical border-status-critical hover:bg-status-critical hover:text-white',
                success:
                    'bg-status-success text-black border-status-success hover:bg-green-400',
                ghost:
                    'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-low hover:text-on-surface',
                link: 'bg-transparent text-primary border-transparent underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-8 px-2.5 text-label-sm',
                default: 'h-10 px-4 text-label-lg',
                lg: 'h-12 px-6 text-headline-sm',
                icon: 'h-10 w-10 px-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, type = 'button', ...props }, ref) => (
        <button
            ref={ref}
            // Defaults to "button": an untyped button inside a form submits it,
            // which silently fired half-filled forms on the product pages.
            type={type}
            data-slot="button"
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
