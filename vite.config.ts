import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const repositoryName = "react-todo-app";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    base: process.env.NODE_ENV === "production" ? `/${repositoryName}/` : "/",
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          404: path.resolve(__dirname, "404.html"),
        },
      },
    },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
  },
});