import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  html: { template: './public/index.html' },
  server: { proxy: { '/api': process.env.API_URL } },
});
