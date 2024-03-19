import * as path from "node:path";

import { readJSON } from "#/functions/readJSON";

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

    return await readJSON<packageJson>(_path);
};

export type { packageJson };
export { packageJsonLoader };
