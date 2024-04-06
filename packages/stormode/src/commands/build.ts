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

    const start: number = performance.now() ?? new Date().getTime();

    // type
    await fse.writeFile(
        path.join(outDir, "package.json"),
        JSON.stringify({ type: isModule ? "module" : "commonjs" }),
    );

    // bundle mode
    if (config.build.bundle) {
        terminal.wait("Bundling...");

        // transpile
        await transpileDir({
            config,
            inDir,
            outDir,
        });

        // bundle
        await bundle({
            config,
            inDir: outDir,
            outDir: outDir,
        });
    }
    // build mode
    else {
        terminal.wait("Building...");

        // transpile and build
        await build({
            config,
            inDir: inDir,
            outDir: outDir,
        });
    }

    const end: number = performance.now() ?? new Date().getTime();

    const result: number = end - start;

    let total: string;

    if (result >= 1) {
        if (result >= 1000) {
            total = `${Math.trunc(result / 1000)}s`;
        } else {
            total = `${Math.trunc(result)}ms`;
        }
    } else {
        const msStr: string = result.toString();
        const nonZeroPos: number = Math.abs(Math.floor(Math.log10(result))) + 1;
        total = `${msStr.slice(0, msStr.indexOf(".") + nonZeroPos)}ms`;
    }

    // done
    terminal.ready(`Completed in ${total}`);
};

export { runBuild };
