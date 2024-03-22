import * as path from "node:path";

import { readJSON } from "#/functions/readJSON";
import { root } from "#/configs/env";

import { set, get } from "#/utils/store";

type _PackageJson = {
    name: string;
    version: string;
    description: string;
    type: "module" | "commonjs";
};

type PackageJson = Partial<_PackageJson>;

const packageJsonLoader = async (): Promise<PackageJson | null> => {
    // cache
    const cached: string | undefined = await get("packageJson");
    if (cached) return await JSON.parse(cached);

    // declarations
    const _path: string = path.resolve(root, "package.json");

    const json: PackageJson | null = await readJSON<PackageJson>(_path);

    json && (await set("packageJson", JSON.stringify(json)));

    return json;
};

const stormodePackageJsonLoader = async (): Promise<PackageJson | null> => {
    // cache
    const cached: string | undefined = await get("stormodePackageJson");
    if (cached) return await JSON.parse(cached);

    // declarations
    const _path: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "package.json",
    );

    const json: PackageJson | null = await readJSON<PackageJson>(_path);

    json && (await set("stormodePackageJson", JSON.stringify(json)));

    return json;
};

export type { PackageJson };
export { packageJsonLoader, stormodePackageJsonLoader };
