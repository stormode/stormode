import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import * as fse from "fs-extra";

import { cwd } from "#/configs/env";

import { deepMerge } from "#/functions/deepMerge";

const tsConfigLoader = async (
    configPath: string,
): Promise<TranspileOptions | null> => {
    // declarations
    const _path: string = path.resolve(cwd, configPath);

    if (await fse.exists(_path)) {
        // declarations
        const tsConfig: TranspileOptions = await fse.readJSON(_path);

        /* If the config file is extended from another file, merge them */

        // @ts-expect-error "extends" is not included in TranspileOptions
        if (tsConfig.extends) {
            const extendedConfigPath: string = path.resolve(
                path.dirname(_path),
                // @ts-expect-error "extends" is not included in TranspileOptions
                tsConfig.extends,
            );

            const extendedConfig: TranspileOptions | null =
                await tsConfigLoader(extendedConfigPath);

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
    } else {
        return null;
    }
};

export { tsConfigLoader };
