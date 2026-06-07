import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  html: { template: './public/index.html' },
  server: { host: true, proxy: { '/api': process.env.API_URL } },
  tools: { rspack: { watchOptions: { poll: 1000 } } },
});
