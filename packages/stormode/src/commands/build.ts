import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";

import { transpileDir } from "#/utils/transpile/dir";
import { bundle } from "#/utils/bundle";
import { build } from "#/utils/build";

const runBuild = async (config: ImpartialConfig): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");

    const inDir: string = path.join(root, config.rootDir);
    const outDir: string = path.join(root, config.outDir);

    // clear directory
    await fse.emptyDir(outDir);

    const start: Date = new Date();

    // transpile
    await transpileDir({
        config,
        inDir,
        outDir,
    });

    // bundle / build
    if (config.build.bundle) {
        terminal.wait("Bundling...");

        await bundle({
            config,
            inDir: outDir,
            outDir: outDir,
        });
    } else {
        terminal.wait("Building...");

        await build({
            config,
            inDir: outDir,
            outDir: outDir,
        });
    }

    const end: Date = new Date();

    // done
    terminal.ready(`Completed in ${end.getTime() - start.getTime()}ms`);
};

export { runBuild };
