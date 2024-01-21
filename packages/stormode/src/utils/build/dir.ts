import type { ImpartialConfig } from "../../@types/config";

import * as path from "node:path";
import { spawnSync } from "node:child_process";

import * as fse from "fs-extra";
import terminal from "stormode-terminal";
import * as esbuild from "esbuild";
import { replaceTscAliasPaths } from "tsc-alias";

import envGetter from "../envs/getter";

const cwd = process.cwd();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildDir = async (
    config: ImpartialConfig,
    rootDir: string,
    tempDir: string,
    outDir: string,
    silent: boolean = false,
): Promise<void> => {
    try {
        // declarations
        const isDev: boolean = process.env.NODE_ENV === "development";

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

            spawnSync(
                tsc,
                [
                    "--project",
                    tsConfigPath,
                    "--rootDir",
                    rootDir,
                    "--outDir",
                    tempDir,
                    "--sourceMap",
                    sourceMap.toString(),
                ],
                { shell: true },
            );
        }

        // esbuild
        !silent && terminal.wait("Building...");

        const useEsbuild = async (
            rootDir: string,
            outDir: string,
        ): Promise<void> => {
            const files: string[] = await fse.readdir(rootDir);

            await Promise.all(
                files.map(async (file) => {
                    const rootPath: string = path.join(rootDir, file);
                    const outPath: string = path.join(outDir, file);

                    const stats = await fse.stat(rootPath);

                    // dir
                    if (stats.isDirectory()) {
                        await fse.ensureDir(rootPath);
                        await useEsbuild(rootPath, outPath);
                    } else {
                        if (rootPath.endsWith(".js")) {
                            const maxRetry = 5;

                            const esb = async (retryCount = 0) => {
                                try {
                                    await esbuild.build({
                                        define: await envGetter(),
                                        entryPoints: [rootPath],
                                        outfile: outPath,
                                        minify: isDev
                                            ? false
                                            : config.build.minify,
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
                    }
                }),
            );
        };

        if (await fse.pathExists(outDir)) {
            await fse.rm(outDir, { recursive: true });
        }

        await useEsbuild(isTs ? tempDir : rootDir, outDir);

        // typescript alias
        if (isTs) {
            !silent && terminal.wait("Applying alias...");
            await replaceTscAliasPaths({
                configFile: tsConfigPath,
                outDir: outDir,
            });
        }

        // remove temp
        if (await fse.exists(tempDir)) {
            await fse.rm(tempDir, { recursive: true });
        }

        !silent && terminal.ready("Build completed.");
    } catch (err: any) {
        throw new Error(err);
    }
};

export default buildDir;
