import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import { readJSON } from "#/functions/readJSON";
import { deepMerge } from "#/functions/deepMerge";

type tsConfigLoaderOptions = {
    path: string;
};

const tsConfigLoader = async (
    options: tsConfigLoaderOptions,
): Promise<TranspileOptions | null> => {
    // declarations
    const _o: tsConfigLoaderOptions = options;
    const tsConfig: TranspileOptions | null = await readJSON<TranspileOptions>(
        _o.path,
    );

    /* If the config file is extended from another file, merge them */

    // @ts-expect-error - "extends" is not included in TranspileOptions
    if (tsConfig?.extends) {
        const extendedConfigPath: string = path.resolve(
            path.dirname(_o.path),
            // @ts-expect-error - "extends" is not included in TranspileOptions
            tsConfig.extends,
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
