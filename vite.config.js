import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const bootcampInputs = Object.fromEntries(
  readdirSync(projectRoot)
    .filter((file) => /^boot\d+\.html$/i.test(file))
    .map((file) => [file.replace(/\.html$/i, ''), resolve(projectRoot, file)]),
);

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/dist/**'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/uploads': 'http://127.0.0.1:3001',
    },
  },
  plugins: [
    react(),
    {
      name: 'react-bootcamp-pages',
      transformIndexHtml: {
        order: 'pre',
        handler(_html, { path }) {
          const match = path.match(/\/boot(\d+)\.html$/i);
          if (!match) return;
          return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bootcamp Details</title>
    <link href="/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="/assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
    <link href="/assets/css/main.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
  },
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(projectRoot, 'index.html'),
        admin: resolve(projectRoot, 'admin.html'),
        upcoming: resolve(projectRoot, 'upcoming.html'),
        bootcamps: resolve(projectRoot, 'bootcamps.html'),
        ...bootcampInputs,
      },
    },
  },
});