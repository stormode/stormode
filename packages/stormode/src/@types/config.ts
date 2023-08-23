/**
 * base configs
 */
type base = {
	/**
	 * input directory
	 * default: src
	 */
	rootDir: string;
	/**
	 * output directory
	 * default: .stormode
	 */
	outDir: string;
	// index file, defualt: index.ts/index.js
	/**
	 * index file
	 * default: index.ts / index.js
	 */
	index: string;
	/**
	 * tsconfig.json path
	 * default: tsconfig.json
	 */
	tsconfig: string;
};

/**
 * server configs
 */
type server = {
	/**
	 * directories / files to monitor other than rootDir
	 * default: []
	 */
	watch: string[];
	/**
	 * files to ignore based on watch
	 * default: []
	 */
	ignore: string[];
};

/**
 * build configs
 */
type build = {
	/**
	 * minify code
	 * default: false
	 */
	minify: boolean;
	/**
	 * generate sourcemap on build
	 * default: false
	 */
	sourcemap: boolean;
	/**
	 * tsconfig.json path with higer priority
	 * default: tsconfig.json
	 */
	tsconfig: string;
};

type Config = Partial<base> & {
	server?: Partial<server>;
	build?: Partial<build>;
};

type ImpartialConfig = base & {
	server: server;
	build: build;
};

export type { Config, ImpartialConfig };
