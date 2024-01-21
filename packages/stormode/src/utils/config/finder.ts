import * as path from "node:path";

import * as fse from "fs-extra";

const cwd = process.cwd();

const configFinder = async (): Promise<string> => {
    // default paths
    const base: string = "stormode.config.";
    const jsPath: string = `${base}js`;
    const cjsPath: string = `${base}cjs`;
    const tsPath: string = `${base}ts`;

    // default path
    let configPath = jsPath;

    // stormode.config.cjs
    const rawMjsPath: string = path.resolve(cwd, cjsPath);

    if (await fse.exists(rawMjsPath)) {
        configPath = cjsPath;
    }

    // stormode.config.ts
    const rawTsPath: string = path.resolve(cwd, tsPath);

    if (await fse.exists(rawTsPath)) {
        configPath = tsPath;
    }

    return configPath;
};

export default configFinder;
