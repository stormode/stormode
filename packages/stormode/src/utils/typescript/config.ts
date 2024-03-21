import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import { readJSON } from "#/functions/readJSON";
import { deepMerge } from "#/functions/deepMerge";

type tsConfigLoaderOptions = {
    path: string;
};

type ExtendedTranspileOptions = TranspileOptions & {
    extends?: string;
};

const tsConfigLoader = async (
    options: tsConfigLoaderOptions,
): Promise<TranspileOptions | null> => {
    // declarations
    const o: tsConfigLoaderOptions = options;
    const tsConfig: TranspileOptions | null = await readJSON<TranspileOptions>(
        o.path,
    );

    const exTsConfig: ExtendedTranspileOptions | null =
        tsConfig as ExtendedTranspileOptions | null;

    /* If the config file is extended from another file, merge them */

    if (exTsConfig?.extends) {
        const extendedConfigPath: string = path.resolve(
            path.dirname(o.path),
            exTsConfig.extends,
        );

        const extendedConfig: TranspileOptions | null = await tsConfigLoader({
            path: extendedConfigPath,
        });

        if (extendedConfig) {
            // merge
            const merged: TranspileOptions = await deepMerge(
                extendedConfig,
                tsConfig,
            );

            return merged;
        }
    }

    return tsConfig;
};

export { tsConfigLoader };
