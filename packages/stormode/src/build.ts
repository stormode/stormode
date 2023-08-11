import path from "node:path";
import { exec } from "child_process";

import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import terminal from "stormode-terminal";
import { replaceTscAliasPaths } from "tsc-alias";

import type { Config } from "./utils/types";

import tsCheck from "./utils/tscheck";
import tsConfig from "./utils/tsconfig";

const exe = async (command: string): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const process = exec(command);

		// error
		process.stderr &&
			process.stderr.on("data", (data) => {
				const output: string = data.toString().trim();
				if (output.length > 0) {
					terminal.error(output);
				}
			});

		// exit
		process.on("exit", (code) => {
			resolve();
		});

		// error handling for the process
		process.on("error", (err: Error) => {
			terminal.error("Error executing the command:");
			console.log(err.message);
			reject(err);
		});
	});
};

// build
const build = async (config?: Config): Promise<void> => {
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
