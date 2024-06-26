import type { FullConfig } from "#/@types/config";

import * as path from "node:path";

import { build as esbuild } from "esbuild";
import * as fse from "fs-extra";

import { supportedExtensions } from "#/configs/extension";

import { crawl } from "#/functions/crawl";
import { endsWithList } from "#/functions/endsWithList";
import { getModuleType } from "#/functions/getModuleType";
import { getTranspiledName } from "#/functions/getTranspiledName";
import { injectEnv } from "#/functions/inject/env";

import { getProcessEnv } from "#/utils/env";
import { transpile } from "#/utils/transpile/transpile";

type BuildOptions = {
    config: FullConfig;
    inDir: string;
    outDir: string;
};

type BuildProcessOptions = BuildOptions;

const buildProcess = async (options: BuildProcessOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    const filePaths: string[] = await crawl({
        path: inDir,
        full: false,
    });

    const format: "esm" | "cjs" =
        (await getModuleType({ config })) === "commonjs" ? "cjs" : "esm";

    await Promise.all(
        filePaths.map(async (filePath: string): Promise<void> => {
            // declarations
            const inPath: string = path.join(inDir, filePath);
            const outPath: string = path.join(
                outDir,
                path.dirname(filePath),
                getTranspiledName(path.basename(filePath)),
            );

            if (endsWithList(inPath, supportedExtensions)) {
                // transpile
                await transpile({
                    config,
                    inPath: inPath,
                    outPath: outPath,
                });

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
                    entryPoints: [outPath],
                    bundle: false,
                    minify: config.build.minify,
                    sourcemap: config.build.sourceMap,
                });
            }
            // copy
            else {
                await fse.copy(inPath, outPath);
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
