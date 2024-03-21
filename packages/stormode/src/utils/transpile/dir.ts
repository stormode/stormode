import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { supportedExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { transpile } from "#/utils/transpile/transpile";

type BuildDirOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

const transpileDir = async (options: BuildDirOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    // read directory
    const files: string[] = await fse.readdir(inDir);

    await Promise.all(
        files.map(async (file: string): Promise<void> => {
            // declarations
            const inPath: string = path.join(inDir, file);
            const outPath: string = path.join(outDir, file);

            const stats: fse.Stats = await fse.stat(inPath);

            // directory
            if (stats.isDirectory()) {
                await transpileDir({
                    config,
                    inDir: inPath,
                    outDir: outPath,
                });
            }
            // file
            else {
                // transpile ts/js
                if (endsWithList(inPath, supportedExtensions)) {
                    const _outPath: string = path.join(
                        outDir,
                        getTranspiledName(file),
                    );

                    // transpile
                    await transpile({
                        config,
                        inPath: inPath,
                        outPath: _outPath,
                    });
                }
                // copy
                else {
                    await fse.copy(inPath, outPath);
                }
            }
        }),
    );
};

export { transpileDir };
