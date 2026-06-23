import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		// PORT lets a second instance (e.g. preview tooling) run alongside the
		// default dev server on 3000.
		port: Number(process.env.PORT) || 3000,
	},
	build: {
		outDir: "dist",
	},
});
