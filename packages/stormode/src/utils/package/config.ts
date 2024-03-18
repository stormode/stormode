import * as path from "node:path";

import * as fse from "fs-extra";

type packageJson = {
    name: string;
    version: string;
    description: string;
};

const packageJsonLoader = async (): Promise<packageJson | null> => {
    // declarations
    const _path: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "package.json",
    );

    if (await fse.exists(_path)) {
        const packageJson: packageJson = await fse.readJSON(_path);

        return packageJson;
    } else {
        return null;
    }
};

export type { packageJson };
export { packageJsonLoader };
