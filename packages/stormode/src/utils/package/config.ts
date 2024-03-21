import * as path from "node:path";

import { readJSON } from "#/functions/readJSON";
import { root } from "#/configs/env";

type _PackageJson = {
    name: string;
    version: string;
    description: string;
    type: "module" | "commonjs";
};

type PackageJson = Partial<_PackageJson>;

const packageJsonLoader = async (): Promise<PackageJson | null> => {
    // declarations
    const _path: string = path.resolve(root, "package.json");

    return await readJSON<PackageJson>(_path);
};

const stormodePackageJsonLoader = async (): Promise<PackageJson | null> => {
    // declarations
    const _path: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "package.json",
    );

    return await readJSON<PackageJson>(_path);
};

export type { PackageJson };
export { packageJsonLoader, stormodePackageJsonLoader };
