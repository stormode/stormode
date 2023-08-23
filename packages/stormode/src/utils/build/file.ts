import type { ImpartialConfig } from "../../@types/config";

import * as path from "node:path";
import { spawnSync } from "node:child_process";

import * as fse from "fs-extra";
import terminal from "stormode-terminal";
import * as esbuild from "esbuild";
import {
	prepareSingleFileReplaceTscAliasPaths,
	SingleFileReplacer,
} from "tsc-alias";

import tsConfig from "../typescript/config";
import envGetter from "../envs/getter";

const cwd = process.cwd();

const isInside = (basePath: string, targetPath: string) => {
	const relative = path.relative(basePath, targetPath);
	return !relative.startsWith("..") && !path.isAbsolute(relative);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildFile = async (
	config: ImpartialConfig,
	rootDir: string,
	tempDir: string,
	outDir: string,
	filePath: string,
	silent: boolean = false,
): Promise<void> => {
	// target file not inside root
	if (!isInside(rootDir, filePath)) return;

	// declarations
	const isDev: boolean = process.env.NODE_ENV === "development";

	const dirName: string = path.relative(rootDir, path.dirname(filePath));
	const fileName: string = path.basename(filePath);

	const fileRootDir: string = path.join(rootDir, dirName);
	const fileTempDir: string = path.join(tempDir, dirName);
	const fileOutDir: string = path.join(outDir, dirName);

	const rootPath: string = path.join(fileRootDir, fileName);
	const tempPath: string = path.join(
		fileTempDir,
		fileName.replace("ts", "js"),
	);
	let esTargetPath: string | null = null;
	const outPath: string = path.join(fileOutDir, fileName.replace("ts", "js"));
	const outMapPath: string = path.join(
		fileOutDir,
		fileName.replace("ts", "js.map"),
	);

	const isTs: boolean = config.index.endsWith(".ts");
	const tsConfigPath: string = path.resolve(cwd, config.tsconfig);
	const sourceMap: boolean = isDev ? true : config.build.sourcemap;

	// typescript
	if (isTs) {
		const tsc = path.resolve(cwd, "node_modules", ".bin", "tsc");
		const tscExists = await fse.exists(tsc);

		if (!tscExists)
			throw new Error(
				"Tsc command not found, please install TypeScript dependency",
			);

		!silent && terminal.wait("Transpiling...");

		const tsconfig = await tsConfig(tsConfigPath);
		if (!tsconfig) throw new Error("Unable to find tsconfig.json");

		const tsOptions = tsconfig.compilerOptions;
		const tsModule: string = tsOptions?.module ?? "commonjs";
		const tsTarget: string = tsOptions?.target ?? "es5";
		const tsMdRes: string = tsOptions?.moduleResolution ?? "node";
		const tsEsItp: boolean = tsOptions?.esModuleInterop ?? true;
		const tsJsMod: boolean = tsOptions?.resolveJsonModule ?? true;
		const tsSkLib: boolean = tsOptions?.skipLibCheck ?? true;

		spawnSync(
			tsc,
			[
				rootPath,
				"--outDir",
				fileTempDir,
				"--module",
				tsModule,
				"--target",
				tsTarget,
				"--moduleResolution",
				tsMdRes,
				"--sourceMap",
				sourceMap.toString(),
				"--esModuleInterop",
				tsEsItp.toString(),
				"--resolveJsonModule",
				tsJsMod.toString(),
				"--skipLibCheck",
				tsSkLib.toString(),
			],
			{ shell: true },
		);
	}

	// esbuild
	!silent && terminal.wait("Building...");

	if (isTs) {
		esTargetPath = tempPath;
	} else {
		esTargetPath = outPath;
	}

	// js file
	if (esTargetPath.endsWith(".js")) {
		await fse.remove(outPath);
		await fse.remove(outMapPath);

		const maxRetry = 5;

		const esb = async (retryCount = 0) => {
			try {
				await esbuild.build({
					define: await envGetter(),
					entryPoints: [esTargetPath!],
					outfile: outPath,
					minify: isDev ? false : config.build.minify,
					sourcemap: sourceMap,
					logLevel: "silent",
				});
			} catch (err) {
				if (retryCount < maxRetry) {
					await sleep(100);
					await esb(retryCount + 1);
				} else {
					throw err;
				}
			}
		};

		await esb();
	}
	// copy
	else {
		await fse.copy(rootPath, outPath);
	}

	// typescript alias
	if (isTs) {
		!silent && terminal.wait("Applying alias...");
		const trans: SingleFileReplacer =
			await prepareSingleFileReplaceTscAliasPaths({
				configFile: tsConfigPath,
				outDir: outDir,
			});

		const readContent = await fse.readFile(outPath, "utf-8");
		const content = await trans({
			filePath: outPath,
			fileContents: readContent,
		});

		await fse.writeFile(outPath, content);
	}

	// remove temp
	if (await fse.exists(tempDir)) {
		await fse.rm(tempDir, { recursive: true });
	}

	!silent && terminal.ready("Build completed.");
};

export default buildFile;
