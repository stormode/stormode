import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";
import { tsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";

import { transpileDir } from "#/utils/transpile/dir";
import { bundler } from "#/utils/bundle";
import { dirBuilder } from "#/utils/build";

const build = async (config: ImpartialConfig): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");
    const isTs: boolean = endsWithList(config.index, tsExtensions);

    const inPath: string = path.join(root, config.rootDir);
    const outPath: string = path.join(root, config.outDir);

    // clear directory
    await fse.emptyDir(outPath);

    // transpile
    if (isTs) {
        terminal.wait("Transpiling...");

        await transpileDir({
            config,
            inDir: inPath,
            outDir: outPath,
        });
    }

    // bundle / build
    if (config.build.bundle) {
        terminal.wait("Bundling...");
        await bundler({
            config,
            inDir: outPath,
            outDir: outPath,
        });
    } else {
        terminal.wait("Building...");
        await dirBuilder({
            config,
            inDir: outPath,
            outDir: outPath,
        });
    }

    // done
    if (config.build.bundle) {
        terminal.ready("Bundle completed.");
    } else {
        terminal.ready("Build completed.");
    }
};

export { build };
