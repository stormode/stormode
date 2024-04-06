import type { FullConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { supportedExtensions } from "#/configs/extension";

import { crawl } from "#/functions/crawl";
import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { transpile } from "#/utils/transpile/transpile";

type TranspileDirOptions = {
    config: FullConfig;
    inDir: string;
    outDir: string;
};

const transpileDir = async (options: TranspileDirOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;

    // read directory
    const filePaths: string[] = await crawl({
        path: inDir,
        full: false,
    });

    await Promise.all(
        filePaths.map(async (filePath: string): Promise<void> => {
            // declarations
            const inPath: string = path.join(inDir, filePath);
            const outPath: string = path.join(outDir, filePath);

            // transpile ts/js
            if (endsWithList(inPath, supportedExtensions)) {
                const _outPath: string = path.join(
                    outDir,
                    path.dirname(filePath),
                    getTranspiledName(path.basename(filePath)),
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
        }),
    );
};

export { transpileDir };
