import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify("1.0.2"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
