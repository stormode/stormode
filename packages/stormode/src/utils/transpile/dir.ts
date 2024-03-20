import type { TranspileOptions, CompilerOptions } from "typescript";
import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";
import { supportedExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { tsConfigLoader } from "#/utils/typescript/config";
import { transpile } from "#/utils/transpile/transpile";

type BuildDirOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

const transpileDir = async (options: BuildDirOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;
    const tsConfig: TranspileOptions | null = await tsConfigLoader({
        path: path.join(root, config.tsconfig),
    });
    const _compilerOptions: CompilerOptions | undefined =
        tsConfig?.compilerOptions;

    // read directory
    const _files: string[] = await fse.readdir(inDir);

    await Promise.all(
        _files.map(async (_file: string): Promise<void> => {
            // declarations
            const _inPath: string = path.join(inDir, _file);
            const _outPath: string = path.join(outDir, _file);

            const _stats: fse.Stats = await fse.stat(_inPath);

            // directory
            if (_stats.isDirectory()) {
                await transpileDir({
                    config,
                    inDir: _inPath,
                    outDir: _outPath,
                });
            }
            // file
            else {
                // transpile ts/js
                if (endsWithList(_inPath, supportedExtensions)) {
                    const _outPath2: string = path.join(
                        outDir,
                        getTranspiledName(_file),
                    );

                    // transpile
                    await transpile({
                        config,
                        compilerOptions: _compilerOptions,
                        inPath: _inPath,
                        outPath: _outPath2,
                    });
                }
                // copy
                else {
                    await fse.copy(_inPath, _outPath);
                }
            }
        }),
    );
};

export { transpileDir };
