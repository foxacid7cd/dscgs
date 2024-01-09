import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import monkey from "vite-plugin-monkey";
import { name, version, author } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: "src/main.ts",
      userscript: {
        name,
        version,
        author: author.name,
        match: ["https://www.discogs.com/*"],
        grant: ["GM.xmlHttpRequest", "GM.getValue", "GM.setValue"],
        "run-at": "document-start",
      },
      server: {
        open: false,
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
    origin: "https://yevheniis-macbook-pro.tailnet-9fda.ts.net",
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5174,
    },
    cors: true,
  },
});
