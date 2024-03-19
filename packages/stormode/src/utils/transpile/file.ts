import type { CompilerOptions, TranspileOptions } from "typescript";
import type { SingleFileReplacer } from "tsc-alias";
import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";
import { transpile } from "typescript";
import { prepareSingleFileReplaceTscAliasPaths } from "tsc-alias";

import { cwd, root } from "#/configs/env";

import { tsConfigLoader } from "#/utils/typescript/config";

type BuildFileOptions = {
    config: ImpartialConfig;
    inPathRoot: string;
    inPath: string;
    outPathRoot: string;
    outPath: string;
};

const transpileFile = async (options: BuildFileOptions): Promise<void> => {
    // declarations
    const { config, inPathRoot, inPath, outPathRoot, outPath } = options;

    const tsConfigPath: string = path.join(root, config.tsconfig);

    // check tsc
    const tsc: string = path.join(cwd, "node_modules", ".bin", "tsc");
    const tscExists: boolean = await fse.exists(tsc);

    if (!tscExists)
        throw new Error(
            "tsc command not found, please install TypeScript dependency",
        );

    // read file
    const rootContent: string = await fse.readFile(inPath, "utf-8");

    // use tsconfig.json config
    const tsConfig: TranspileOptions | null = await tsConfigLoader({
        path: tsConfigPath,
    });

    const transpileCompileOptions: CompilerOptions = {
        ...(tsConfig?.compilerOptions ? tsConfig?.compilerOptions : {}),
        rootDir: inPathRoot,
        outDir: outPathRoot,
        sourceMap: true,
        inlineSourceMap: false,
        inlineSources: false,
    };

    // transpile
    const output: string = transpile(
        rootContent,
        transpileCompileOptions,
        inPath,
    );

    // reaplce absolute paths
    const trans: SingleFileReplacer =
        await prepareSingleFileReplaceTscAliasPaths({
            configFile: tsConfigPath,
            outDir: outPathRoot,
        });

    const content: string = trans({
        filePath: outPath,
        fileContents: output,
    });

    // write file
    await fse.writeFile(outPath, content);
};

export { transpileFile };
