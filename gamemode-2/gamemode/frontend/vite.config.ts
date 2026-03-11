import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    base: "",
    build: {
        reportCompressedSize: false,
        outDir: "../client_packages/package2/dist",
        emptyOutDir: true,
        minify: "esbuild",
        chunkSizeWarningLimit: 5000
    },
    plugins: [react(), viteTsconfigPaths()],
    server: {
        open: true,
        port: 3000
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, "src"),
            utils: path.resolve(__dirname, "src/utils"),
            components: path.resolve(__dirname, "src/components"),
            pages: path.resolve(__dirname, "src/pages"),
            store: path.resolve(__dirname, "src/stores"),
            styles: path.resolve(__dirname, "src/styles"),
            configs: path.resolve(__dirname, "src/configs"),
            assets: path.resolve(__dirname, "src/assets")
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [path.resolve(__dirname, "src/styles")]
            }
        }
    }
});
