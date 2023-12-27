import { defineConfig } from "vite"

export default defineConfig({
    build: {
        modulePreload: false,
        outDir: "./dist",
        minify: true, 
        emptyOutDir: true,
    }
});