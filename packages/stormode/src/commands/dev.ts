import type { FullConfig } from "#/@types/config";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import chokidar from "chokidar";
import * as fse from "fs-extra";

import { cache, root } from "#/configs/env";
import { supportedExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { execute } from "#/functions/execute";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { packageJsonLoader } from "#/utils/package/config";
import { transpileDir } from "#/utils/transpile/dir";
import { transpileFile } from "#/utils/transpile/file";

type RebuildOnChangeOptions = {
    config: FullConfig;
    inDir: string;
    outDir: string;
    file: string;
};

const isInside = (basePath: string, targetPath: string): boolean => {
    const relative: string = path.relative(basePath, targetPath);
    return !relative.startsWith("..") && !path.isAbsolute(relative);
};

// rebuild on change
const rebuild = async (options: RebuildOnChangeOptions): Promise<void> => {
    const { config, inDir, outDir, file } = options;
    const valid: boolean = endsWithList(file, supportedExtensions);

    // transpile
    if (valid) {
        await transpileFile({
            config,
            inPath: path.join(inDir, file),
            outPath: path.join(outDir, getTranspiledName(file)),
        });
    }
    // copy
    else {
        await fse.copy(path.join(inDir, file), path.join(outDir, file));
    }
};

const runDev = async (config: FullConfig): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");

    const packageJson: PackageJson | null = await packageJsonLoader();

    const isModule: boolean =
        packageJson?.type?.toLocaleLowerCase() === "module";

    const inDir: string = path.join(root, config.rootDir);

    const outDir: string = path.join(cache, "build");
    const outFile: string = getTranspiledName(config.index);

    const outPath: string = path.join(outDir, outFile);

    // watcher
    const watch: string[] = [];

    watch.push(config.outDir.replaceAll(/\\/g, "/"));

    for (const p of config.server.watch ?? []) {
        watch.push(p.replaceAll(/\\/g, "/"));
    }

    const ignore: string[] = [];

    for (const p of config.server.ignore ?? []) {
        ignore.push(p.replaceAll(/\\/g, "/"));
    }

    const watcher: chokidar.FSWatcher = chokidar.watch(watch, {
        ignored: ignore,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
        },
    });

    // clear directory
    await fse.emptyDir(outDir);

    // type
    await fse.writeFile(
        path.join(outDir, "package.json"),
        JSON.stringify({ type: isModule ? "module" : "commonjs" }),
    );

    terminal.wait("Transpiling...");

    // transpile
    await transpileDir({
        config,
        inDir: inDir,
        outDir: outDir,
    });

    // run
    execute({
        outPath,
        watcher,
        onChange: async (filePath: string): Promise<boolean> => {
            try {
                terminal.wait("Applying changes...");

                // declarations
                const fileDir: string = path.relative(
                    inDir,
                    path.dirname(filePath),
                );
                const fileName: string = path.basename(filePath);

                // check if inside root to avoid meaningless rebuild
                if (!isInside(root, fileDir)) return false;

                // rebuild
                await rebuild({
                    config,
                    inDir: path.join(inDir, fileDir),
                    outDir: path.join(outDir, fileDir),
                    file: fileName,
                });

                return true;
            } catch (e: unknown) {
                console.error(e instanceof Error ? e.message : String(e));
                terminal.error("Apply failed, waiting for changes...");
                return false;
            }
        },
    });
};

export { runDev };
