import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"auth/index": "src/auth/index.ts",
		"api/index": "src/api/index.ts",
		"types/index": "src/types/index.ts",
		"utils/index": "src/utils/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	sourcemap: false,
	splitting: false,
	treeshake: true,
	minify: false,
});
