import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import { deepMerge } from "#/functions/deepMerge";
import { readJSON } from "#/functions/readJSON";

import { get, set } from "#/utils/store";

type tsConfigLoaderOptions = {
    path: string;
    cache?: boolean;
};

type ExtendedTranspileOptions = TranspileOptions & {
    extends?: string;
};

const tsConfigLoader = async (
    options: tsConfigLoaderOptions,
): Promise<TranspileOptions | null> => {
    const cache: boolean = options.cache !== false;

    // cache
    if (cache) {
        const cached: string | undefined = await get("tsConfig");
        if (cached) return await JSON.parse(cached);
    }

    // declarations
    const o: tsConfigLoaderOptions = options;
    const json: TranspileOptions | null = await readJSON<TranspileOptions>(
        o.path,
    );

    const extJson: ExtendedTranspileOptions | null =
        json as ExtendedTranspileOptions | null;

    /* If the config file is extended from another file, merge them */

    if (extJson?.extends) {
        const extendedConfigPath: string = path.resolve(
            path.dirname(o.path),
            extJson.extends,
        );

        const extendedConfig: TranspileOptions | null = await tsConfigLoader({
            path: extendedConfigPath,
            cache: false,
        });

        if (extendedConfig) {
            // merge
            const merged: TranspileOptions = await deepMerge(
                extendedConfig,
                extJson,
            );

            cache && merged && (await set("tsConfig", JSON.stringify(merged)));

            return merged;
        }
    }

    cache && json && (await set("tsConfig", JSON.stringify(json)));

    return extJson;
};

export { tsConfigLoader };
