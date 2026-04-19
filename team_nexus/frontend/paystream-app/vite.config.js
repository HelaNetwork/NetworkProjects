import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        fs: {
            allow: ['../../..'],
        },
    },
    build: {
        target: 'esnext',
        chunkSizeWarningLimit: 1000, // Increase limit slightly
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ethers: ['ethers'],
                    clerk: ['@clerk/clerk-react'],
                },
            },
        },
    },
});
