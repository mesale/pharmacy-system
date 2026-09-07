import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names, letting later Tailwind utilities win over
 * earlier conflicting ones. Components previously imported this from a
 * non-existent `cn` package, which broke the asset build outright.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
