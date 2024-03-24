import type { FullConfig } from "#/@types/config";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";

import { build } from "#/utils/build";
import { bundle } from "#/utils/bundle";
import { packageJsonLoader } from "#/utils/package/config";
import { transpileDir } from "#/utils/transpile/dir";

const runBuild = async (config: FullConfig): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");

    const packageJson: PackageJson | null = await packageJsonLoader();

    const isModule: boolean =
        packageJson?.type?.toLocaleLowerCase() === "module";

    const inDir: string = path.join(root, config.rootDir);
    const outDir: string = path.join(root, config.outDir);

    // clear directory
    await fse.emptyDir(outDir);

    const start: Date = new Date();

    // type
    await fse.writeFile(
        path.join(outDir, "package.json"),
        JSON.stringify({ type: isModule ? "module" : "commonjs" }),
    );

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
