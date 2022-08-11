import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        assetsInlineLimit: 0,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                upload: resolve(__dirname, 'upload/index.html'),
                photo: resolve(__dirname, 'photo/index.html'),
            },
        },
    },
});
