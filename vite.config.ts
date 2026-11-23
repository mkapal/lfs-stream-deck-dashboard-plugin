import { streamDeckReact } from "@fcannizzaro/streamdeck-react/vite";
import react from "@vitejs/plugin-react";
import { builtinModules } from "node:module";
import { resolve } from "node:path";
import { defineConfig, esmExternalRequirePlugin } from "vite";

const builtins = builtinModules.flatMap((m) => [m, `node:${m}`]);

const sdPluginDir = resolve(
  import.meta.dirname,
  "com.martinkapal.lfs.dashboard.sdPlugin",
);

export default defineConfig({
  root: import.meta.dirname,
  resolve: { conditions: ["node"] },
  plugins: [
    esmExternalRequirePlugin({ external: builtins }),
    react(),
    streamDeckReact({
      manifest: {
        uuid: "com.martinkapal.lfs.dashboard",
        name: "Live for Speed Dashboard",
        author: "Martin Kapal",
        description: "Display and control your Live for Speed Dashboard",
        icon: "imgs/plugin/marketplace",
        categoryIcon: "imgs/plugin/category-icon",
        propertyInspectorPath: "ui/connection.html",
        version: "0.1.0.0",
        category: "Live for Speed Dashboard",
        sdkVersion: 3,
        nodejs: { version: "24", debug: "enabled" },
      },
    }),
  ],
  build: {
    target: "node24",
    outDir: resolve(sdPluginDir, "bin"),
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    // Dash light icons are inlined as data URIs so they can be rendered by <Image>.
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    lib: {
      entry: resolve(import.meta.dirname, "src/plugin.ts"),
      formats: ["es"],
      fileName: () => "plugin.mjs",
    },
    rolldownOptions: {
      output: { codeSplitting: false },
    },
  },
});
