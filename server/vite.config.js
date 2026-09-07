import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            // Every page imports via `@/...`. Vite does not read the `paths`
            // entries in tsconfig.json or jsconfig.json — those only inform the
            // editor — so the alias has to be declared here for the build to
            // resolve them.
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
});
