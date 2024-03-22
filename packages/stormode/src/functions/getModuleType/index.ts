import type { CompilerOptions, ModuleKind, TranspileOptions } from "typescript";
import type { ImpartialConfig } from "#/@types/config";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import { root } from "#/configs/env";

import { packageJsonLoader } from "#/utils/package/config";
import { tsConfigLoader } from "#/utils/typescript/config";

type ModuleType = "es6" | "nodenext" | "commonjs";

type GetModuleOptions = {
    config: ImpartialConfig;
};

// biome-ignore lint: string
const moduleType = (val: any): ModuleType => {
    const _val: string = (val ?? "").toLowerCase();

    switch (_val) {
        case "es6":
        case "es2015":
        case "es2020":
        case "es2022":
        case "esnext":
            return "es6";
        case "node":
        case "node16":
        case "nodenext":
            return "nodenext";
        default:
            return "commonjs";
    }
};

const getModuleType = async (
    options: GetModuleOptions,
): Promise<ModuleType> => {
    const packageJson: PackageJson | null = await packageJsonLoader();
    const tsconfigJson: TranspileOptions | null = await tsConfigLoader({
        path: path.join(root, options.config.tsconfig),
    });

    const compilerOptions: CompilerOptions | undefined =
        tsconfigJson?.compilerOptions;

    return moduleType(
        options.config.swc.module?.type ??
            (compilerOptions?.module as keyof typeof ModuleKind | undefined) ??
            (packageJson?.type?.toLowerCase() === "module"
                ? "ES2015"
                : "CommonJS"),
    );
};

export type { ModuleType };
export { getModuleType, moduleType };
