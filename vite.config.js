import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const laravelAppUrl = process.env.VITE_DEV_SERVER_URL?.replace(/:\d+$/, ':8000')
    ?? 'http://127.0.0.1:8000';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue(),
        tailwindcss(),
        {
            name: 'redirect-app-routes-to-laravel',
            enforce: 'pre',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url ?? '/';
                    const isViteInternal = url.startsWith('/@')
                        || url.startsWith('/node_modules')
                        || url.startsWith('/resources')
                        || url.includes('.')
                        || req.method !== 'GET';

                    if (! isViteInternal) {
                        res.writeHead(302, { Location: `${laravelAppUrl}${url}` });
                        res.end();

                        return;
                    }

                    next();
                });
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
