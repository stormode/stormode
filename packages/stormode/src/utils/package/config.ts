import * as path from "node:path";

import { root } from "#/configs/env";
import { readJSON } from "#/functions/readJSON";

type _PackageJson = {
    name: string;
    version: string;
    description: string;
    type: "module" | "commonjs";
};

type PackageJson = Partial<_PackageJson>;

let pjCache: PackageJson | null = null;
let spjCache: PackageJson | null = null;

const packageJsonLoader = async (): Promise<PackageJson | null> => {
    // cache
    if (pjCache) return pjCache;

    // declarations
    const _path: string = path.resolve(root, "package.json");

    const json: PackageJson | null = await readJSON<PackageJson>(_path);

    if (!json) {
        const { terminal } = await import("#/utils/terminal");
        terminal.error("Unable to find package.json");
        process.exit(1);
    }

    pjCache = json;

    return json;
};

const stormodePackageJsonLoader = async (): Promise<PackageJson | null> => {
    // cache
    if (spjCache) return spjCache;

    // declarations
    const _path: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "package.json",
    );

    const json: PackageJson | null = await readJSON<PackageJson>(_path);

    if (!json) {
        const { terminal } = await import("#/utils/terminal");
        terminal.error("Unable to find package.json in Stormode");
        process.exit(1);
    }

    spjCache = json;

    return json;
};

export type { PackageJson };
export { packageJsonLoader, stormodePackageJsonLoader };
