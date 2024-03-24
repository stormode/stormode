import type { FullConfig } from "#/@types/config";

import * as path from "node:path";

import { build as esbuild } from "esbuild";
import * as fse from "fs-extra";

import { endsWithList } from "#/functions/endsWithList";
import { getModuleType } from "#/functions/getModuleType";
import { getTranspiledName } from "#/functions/getTranspiledName";
import { injectEnv } from "#/functions/inject/env";

import { getProcessEnv } from "#/utils/env";

type BundleOptions = {
    config: FullConfig;
    inDir: string;
    outDir: string;
};

type BundleProcessOptions = BundleOptions;

const bundleProcess = async (options: BundleProcessOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    const index: string = getTranspiledName(config.index);

    const format: "esm" | "cjs" =
        (await getModuleType({ config })) === "commonjs" ? "cjs" : "esm";

    await esbuild({
        // common options
        format,
        platform: "node",
        define: await getProcessEnv(),
        logLevel: "silent",
        // build options
        outfile: path.join(outDir, index),
        allowOverwrite: true,
        chunkNames: "chunks/[name]-[hash]",
        assetNames: "assets/[name]-[hash]",
        // override
        ...config.build.esbuild,
        // no override
        entryPoints: [inDir],
        bundle: true,
        minify: config.build.minify,
        sourcemap: config.build.sourceMap,
    });

    // keep only index.js / index.js.map
    const files: string[] = await fse.readdir(outDir);

    await Promise.all(
        files.map(async (file: string): Promise<void> => {
            if (
                !endsWithList(file, [
                    index,
                    `${index}.map`,
                    "package.json",
                    "chunks",
                    "assets",
                ])
            )
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
