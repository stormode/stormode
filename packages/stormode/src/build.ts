import * as path from "node:path";

import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import terminal from "stormode-terminal";
import { replaceTscAliasPaths } from "tsc-alias";

import type { Config } from "./utils/types";

import exe from "./utils/exe";
import tsCheck from "./utils/tscheck";
import tsConfig from "./utils/tsconfig";

// build
const build = async (config: Config | null = null): Promise<void> => {
	try {
		// declarations 1
		type envType = { [key: string]: string };

		// put env
		const getEnv = async (): Promise<envType> => {
			// envs
			const define: envType = {};

			// put envs
			for (const p in process.env) {
				// unacceptable parameters
				if (
					p === "CommonProgramFiles(x86)" ||
					p === "ProgramFiles(x86)"
				) {
					continue;
				}
				define[`process.env.${p}`] = JSON.stringify(process.env[p]);
			}

			return define;
		};

		// bundle
		const useEsbuild = async (rootDir: string, outDir: string) => {
			// get files
			const files: string[] = await fs.readdir(rootDir);

			// process
			await Promise.all(
				files.map(async (file) => {
					const rootPath: string = path.join(rootDir, file);
					const outPath: string = path.join(outDir, file);

					// loop
					if ((await fs.stat(rootPath)).isDirectory()) {
						await fs.ensureDir(rootPath);
						await useEsbuild(rootPath, outPath);
						return;
					}

					// esbuild
					if (file.endsWith(".js")) {
						await esbuild.build({
							define,
							entryPoints: [rootPath],
							outfile: outPath,
							allowOverwrite: true,
							bundle: config?.build?.bundle ?? false,
							minify: config?.build?.minify ?? false,
							sourcemap: config?.build?.sourcemap ?? false,
							plugins: config?.build?.plugins ?? [],
						});
					}
				}),
			);
		};

		// declarations 2
		const tsCheckResult = await tsCheck(config);
		const tsconfig = await tsConfig();
		const srcDir: string = path.resolve(
			process.cwd(),
			config?.dev?.src ??
				(tsCheckResult
					? tsconfig?.compilerOptions?.rootDir ?? "src"
					: "src"),
		);
		const distDir: string = path.resolve(
			process.cwd(),
			config?.build?.dist ??
				(tsCheckResult
					? tsconfig?.compilerOptions?.outDir ?? "dist"
					: "dist"),
		);
		const define = await getEnv();

		if (tsCheckResult) {
			terminal.wait("Transpiling...");
			// ts => js
			await exe("tsc");
			// absolute path => relative path
			await replaceTscAliasPaths();
		}

		terminal.wait("Building...");

		await useEsbuild(tsCheckResult ? distDir : srcDir, distDir);

		terminal.ready("Build completed");
		return;
	} catch (err) {
		terminal.error("Build failed");
		console.log(err);
		return;
	}
};

export default build;
