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

type BundleProcessOptions = BundleOptions;

const bundleProcess = async (options: BundleProcessOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    const index: string = getTranspiledName(config.index);

    await esbuild({
        // common options
        sourcemap: config.build.sourceMap,
        platform: config.build.platform,
        minify: config.build.minify,
        define: await getProcessEnv(),
        logLevel: "silent",
        // build options
        bundle: true,
        outfile: path.join(outDir, index),
        allowOverwrite: true,
        entryPoints: [inDir],
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
