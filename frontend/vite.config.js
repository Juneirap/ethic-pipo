import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['crypto-js']
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: {
      usePolling: true, 
    },
  },
});
