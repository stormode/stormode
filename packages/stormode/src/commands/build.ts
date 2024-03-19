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

    const inDir: string = path.join(root, config.rootDir);
    const outDir: string = path.join(root, config.outDir);

    // clear directory
    await fse.emptyDir(outDir);

    const start: Date = new Date();

    // transpile
    if (isTs) {
        terminal.wait("Transpiling...");

        await transpileDir({
            config,
            inDir,
            outDir,
        });
    }

    const inDirBuild: string = isTs ? outDir : inDir;

    // bundle / build
    if (config.build.bundle) {
        terminal.wait("Bundling...");

        await bundler({
            config,
            inDir: inDirBuild,
            outDir,
        });
    } else {
        terminal.wait("Building...");

        await dirBuilder({
            config,
            inDir: inDirBuild,
            outDir,
        });
    }

    const end: Date = new Date();

    // done
    terminal.ready(`Completed in ${end.getTime() - start.getTime()}ms`);
};

export { build };
