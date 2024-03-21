import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";
import chokidar from "chokidar";

import { cache, root } from "#/configs/env";
import { supportedExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";
import { execute } from "#/functions/execute";

import { transpileDir } from "#/utils/transpile/dir";
import { transpileFile } from "#/utils/transpile/file";

type RebuildOnChangeOptions = {
    config: ImpartialConfig;
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

const runDev = async (config: ImpartialConfig): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");

    const inDir: string = path.join(root, config.rootDir);

    const outDir: string = path.join(cache, "build");
    const outFile: string = getTranspiledName(config.index);

    const outPath: string = path.join(outDir, outFile);

    // watcher
    const watch: string[] = [
        `${config.rootDir}`,
        ...(config.server.watch ?? []),
    ];
    const ignore: string[] = config.server.ignore ?? [];

    const watcher: chokidar.FSWatcher = chokidar.watch(watch, {
        ignored: ignore,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
        },
    });

    // clear directory
    await fse.emptyDir(outDir);

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
                const _fileDir: string = path.relative(
                    inDir,
                    path.dirname(filePath),
                );
                const _fileName: string = path.basename(filePath);

                // check if inside root to avoid meaningless rebuild
                if (!isInside(root, _fileDir)) return false;

                // rebuild
                await rebuild({
                    config,
                    inDir: path.join(inDir, _fileDir),
                    outDir: path.join(outDir, _fileDir),
                    file: _fileName,
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
