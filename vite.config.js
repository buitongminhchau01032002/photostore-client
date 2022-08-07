import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                upload: resolve(__dirname, 'upload/index.html'),
                photo: resolve(__dirname, 'photo/index.html'),
            },
        },
    },
});
