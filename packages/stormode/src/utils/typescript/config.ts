import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import { deepMerge } from "#/functions/deepMerge";
import { readJSON } from "#/functions/readJSON";

type tsConfigLoaderOptions = {
    path: string;
};

type ExtendedTranspileOptions = TranspileOptions & {
    extends?: string;
};

let cache: TranspileOptions | null = null;

const loader = async (
    options: tsConfigLoaderOptions,
): Promise<TranspileOptions | null> => {
    // declarations
    const o: tsConfigLoaderOptions = options;

    const json: TranspileOptions | null = await readJSON<TranspileOptions>(
        o.path,
    );

    if (!json) return null;

    const extJson: ExtendedTranspileOptions | null =
        json as ExtendedTranspileOptions | null;

    /* If the config file is extended from another file, merge them */

    if (extJson?.extends) {
        const extendedConfigPath: string = path.resolve(
            path.dirname(o.path),
            extJson.extends,
        );

        const extendedConfig: TranspileOptions | null = await loader({
            path: extendedConfigPath,
        });

        if (extendedConfig) {
            // merge
            const merged: TranspileOptions = await deepMerge(
                extendedConfig,
                extJson,
            );

            return merged;
        }
    }

    return json;
};

const tsConfigLoader = async (
    options: tsConfigLoaderOptions,
): Promise<TranspileOptions | null> => {
    // declarations
    const o: tsConfigLoaderOptions = options;

    // check if cached
    if (cache !== null) return cache;

    const json: TranspileOptions | null = await loader(o);

    // cache
    cache = json !== null ? json : {};

    return json;
};

export { tsConfigLoader };
