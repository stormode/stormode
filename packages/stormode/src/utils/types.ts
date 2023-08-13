// config types
export type Config = {
	app?: {
		// will watch file changes in dev.src folder
		// you may add more
		watch?: string[];
		// which files to ignore
		ignore?: string[];
	};
	dev?: {
		// src folder, default: src
		src?: string;
		// index file, defualt: index.ts/index.js
		index?: string;
	};
	build?: {
		// dist folder, default: dist
		dist?: string;
		// bundle dependencies, default: false
		bundle?: boolean;
		// minify code, default: false
		minify?: boolean;
		// generate sourcemap, default: false
		sourcemap?: boolean;
		// esbuild plugins
		plugins?: any[];
	};
};
