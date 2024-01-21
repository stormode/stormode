import { TsConfig } from "../../@types/tsconfig";

import * as path from "node:path";

import * as fse from "fs-extra";

const cwd = process.cwd();

const tsConfig = async (configPath: string): Promise<TsConfig | null> => {
    // declarations
    const cfPath: string = path.resolve(cwd, configPath);

    if (await fse.exists(cfPath)) {
        return require(cfPath);
    } else {
        return null;
    }
};

export default tsConfig;
