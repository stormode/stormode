# Create Your Stormode Configuration

To set up your Stormode configuration, you may create a file named `stormode.config.js` (or `stormode.config.cjs` for ESModule usage). Here's an example:

```typescript
module.exports = {
    /**
     * Use terminal with time
     * @default false
     */
	withTime: false;
	/**
     * The directory of the source code
     * @default "src"
     */
	rootDir: "src";
	/**
     * The index file of the source code
     * @default "index.ts" | "index.js"
     */
	index: "index.ts";
    /**
     * The directory of the output
     * @default "dist"
     */
	outDir: "dist";
    /**
     * The path of `tsconfig.json`
     * @default "tsconfig.json"
     */
	tsconfig: "tsconfig.json",
	/**
     * swc config to override the preset
     * @see https://swc.rs/docs/configuration/compilation
     * @default {}
     */
    swc: {};
	server: {
		/**
     	 * Directories to monitor other than rootDir
     	 * @default []
     	 */
		watch: [],
    	/**
    	 * Directories to ignore based on watch
    	 * @default []
    	 */
		ignore: [],
	},
	build: {
		/**
    	 * Bundle all the files into one
    	 * @default false
    	 */
    	bundle: false;
    	/**
    	 * Minify the code
    	 * @default false
    	 */
		minify: false,
    	/**
    	 * Generate source map on build
    	 * @default false
    	 */
    	sourceMap: false;
		/**
     	 * esbuild config to override the preset
     	 * @see https://esbuild.github.io/api
     	 * @default {}
     	 */
    	esbuild: {};
	},
};
```

## TypeScript

If you prefer to use TypeScript, you may name your configuration file as `stormode.config.ts` and configure it as below to enjoy some TypeScript flavor:

```typescript
import type { Config } from "stormode";

const config: Config = {
	// ...
};

export default config;
```
