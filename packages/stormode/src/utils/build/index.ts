import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";
import { build as esbuild } from "esbuild";

import { jsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { envGetter } from "#/utils/env/getter";
import { injectEnv } from "#/functions/inject/env";

type BuildOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

type UseBuildOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

const buildProcess = async (options: UseBuildOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    // read directory
    const files: string[] = await fse.readdir(inDir);

    await Promise.all(
        files.map(async (file: string): Promise<void> => {
            // declarations
            const _inPath: string = path.join(inDir, file);
            const _outPath: string = path.join(outDir, file);

            const _stats: fse.Stats = await fse.stat(_inPath);

            // directory
            if (_stats.isDirectory()) {
                await buildProcess({
                    config,
                    inDir: _inPath,
                    outDir: _outPath,
                });
            }
            // file
            else {
                if (endsWithList(_inPath, jsExtensions)) {
                    await esbuild({
                        allowOverwrite: true,
                        define: await envGetter(),
                        entryPoints: [_inPath],
                        outfile: _outPath,
                        bundle: false,
                        minify: config.build.minify,
                        logLevel: "silent",
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
