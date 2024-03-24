import type { FullConfig } from "#/@types/config";

import * as path from "node:path";

import { build as esbuild } from "esbuild";
import * as fse from "fs-extra";

import { jsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getModuleType } from "#/functions/getModuleType";
import { getTranspiledName } from "#/functions/getTranspiledName";
import { injectEnv } from "#/functions/inject/env";

import { getProcessEnv } from "#/utils/env";

type BuildOptions = {
    config: FullConfig;
    inDir: string;
    outDir: string;
};

type BuildProcessOptions = BuildOptions;

const buildProcess = async (options: BuildProcessOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    const format: "esm" | "cjs" =
        (await getModuleType({ config })) === "commonjs" ? "cjs" : "esm";

    // read directory
    const files: string[] = await fse.readdir(inDir);

    await Promise.all(
        files.map(async (file: string): Promise<void> => {
            // declarations
            const inPath: string = path.join(inDir, file);
            const outPath: string = path.join(outDir, file);

            const stats: fse.Stats = await fse.stat(inPath);

            // directory
            if (stats.isDirectory()) {
                await buildProcess({
                    config,
                    inDir: inPath,
                    outDir: outPath,
                });
            }
            // file
            else {
                if (endsWithList(inPath, jsExtensions)) {
                    await esbuild({
                        // common options
                        format,
                        define: await getProcessEnv(),
                        logLevel: "silent",
                        // build options
                        outfile: outPath,
                        allowOverwrite: true,
                        // override
                        ...config.build.esbuild,
                        // no override
                        entryPoints: [inPath],
                        bundle: false,
                        minify: config.build.minify,
                        sourcemap: config.build.sourceMap,
                    });
                }
            }
        }),
    );
};

const build = async (options: BuildOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    // build
    await buildProcess({
        config,
        inDir,
        outDir,
    });

    // inject NODE_ENV
    const outIndex: string = path.join(outDir, getTranspiledName(config.index));
    await injectEnv({
        config,
        path: outIndex,
    });
};

export { build };
