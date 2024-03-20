import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";
import { build as esbuild } from "esbuild";

import { getTranspiledName } from "#/functions/getTranspiledName";
import { endsWithList } from "#/functions/endsWithList";
import { injectEnv } from "#/functions/inject/env";

import { getProcessEnv } from "#/utils/env";

type BundleOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

type EsbuildOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

const bundleProcess = async (options: EsbuildOptions) => {
    // declarations
    const { config, inDir, outDir } = options;

    const index: string = getTranspiledName(config.index);

    await esbuild({
        allowOverwrite: true,
        define: await getProcessEnv(),
        entryPoints: [inDir],
        outfile: path.join(outDir, index),
        platform: config.build.platform,
        bundle: true,
        minify: config.build.minify,
        logLevel: "silent",
        sourcemap: config.build.sourceMap,
    });

    // keep only index.js / index.js.map
    const files: string[] = await fse.readdir(outDir);

    await Promise.all(
        files.map(async (file: string): Promise<void> => {
            if (!endsWithList(file, [index, `${index}.map`]))
                await fse.rm(path.join(outDir, file), { recursive: true });
        }),
    );
};

const bundle = async (options: BundleOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    // bundle
    await bundleProcess({
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

export { bundle };
