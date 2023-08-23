import type { ImpartialConfig } from "../@types/config";

import * as path from "node:path";

import buildDir from "../utils/build/dir";

const cwd = process.cwd();

const build = async (config: ImpartialConfig): Promise<void> => {
	// declarations
	const rootDir: string = path.resolve(cwd, config.rootDir);
	const tempDir: string = path.resolve(cwd, config.outDir, ".temp");
	const outDir: string = path.resolve(cwd, config.outDir, "dist");

	await buildDir(config, rootDir, tempDir, outDir);
};

export default build;
