import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { homedir } from 'os';
import { resolve } from 'path';

const herdCertPath = resolve(homedir(), 'Library/Application Support/Herd/config/valet/Certificates');

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: 'hospital-management.test',
        port: 5173,
        https: {
            cert: resolve(herdCertPath, 'hospital-management.test.crt'),
            key: resolve(herdCertPath, 'hospital-management.test.key'),
        },
    },
});
