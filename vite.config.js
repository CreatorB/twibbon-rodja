import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to copy .env to dist
function copyEnvPlugin() {
  return {
    name: "copy-env",
    closeBundle() {
      const src = resolve(__dirname, ".env");
      const dest = resolve(__dirname, "dist", ".env");
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log("Copied .env to dist");
      }
    },
  };
}

export default defineConfig({
  plugins: [copyEnvPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify("1.0.3"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
