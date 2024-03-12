import type { TranspileOptions } from "typescript";

import * as path from "node:path";

import * as fse from "fs-extra";

import { cwd } from "#/configs/env";

const tsConfigLoader = async (
    configPath: string,
): Promise<TranspileOptions | null> => {
    // declarations
    const _path: string = path.resolve(cwd, configPath);

    if (await fse.exists(_path)) {
        const tsConfig: string = await fse.readFile(_path, "utf-8");
        return await JSON.parse(tsConfig);
    } else {
        return null;
    }
};

export { tsConfigLoader };
