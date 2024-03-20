import type { TranspileOptions } from "typescript";
import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import { root } from "#/configs/env";

import { tsConfigLoader } from "#/utils/typescript/config";
import { transpile } from "#/utils/transpile/transpile";

type BuildFileOptions = {
    config: ImpartialConfig;
    inPath: string;
    outPath: string;
};

const transpileFile = async (options: BuildFileOptions): Promise<void> => {
    // declarations
    const { config, inPath, outPath } = options;

    // use tsconfig.json config
    const tsConfig: TranspileOptions | null = await tsConfigLoader({
        path: path.join(root, config.tsconfig),
    });

    // transpile
    await transpile({
        config,
        compilerOptions: tsConfig?.compilerOptions,
        inPath,
        outPath,
    });
};

export { transpileFile };
