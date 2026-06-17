import { defineConfig } from "astro/config";

export default defineConfig({
  server: { open: true, host: true },
  devToolbar: { enabled: false },
});
