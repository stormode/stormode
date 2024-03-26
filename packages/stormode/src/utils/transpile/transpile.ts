import type {
    AmdConfig,
    CommonJsConfig,
    Es6Config,
    JscTarget,
    ModuleConfig,
    NodeNextConfig,
    Output,
    Options as SwcOptions,
    UmdConfig,
} from "@swc/core";
import type {
    CompilerOptions,
    ScriptTarget,
    TranspileOptions,
} from "typescript";
import type { FullConfig } from "#/@types/config";
import type { ModuleType } from "#/functions/getModuleType";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import { transformFile } from "@swc/core";
import * as fse from "fs-extra";

import { isDev, root } from "#/configs/env";
import { tsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getModuleType } from "#/functions/getModuleType";

import { packageJsonLoader } from "#/utils/package/config";
import { tsConfigLoader } from "#/utils/typescript/config";

type Options = {
    config: FullConfig;
    inPath: string;
    outPath: string;
};

type NonSystemjsConfig =
    | Es6Config
    | CommonJsConfig
    | UmdConfig
    | AmdConfig
    | NodeNextConfig;

type ExtendedModuleConfig = ModuleConfig & {
    resolveFully?: boolean;
};

const ESTarget = (val: keyof typeof ScriptTarget | undefined): JscTarget => {
    const _val: string = (val ?? "").toLowerCase();

    switch (_val) {
        case "es3":
        case "es5":
        case "es2015":
        case "es2016":
        case "es2017":
        case "es2018":
        case "es2019":
        case "es2020":
        case "es2021":
        case "es2022":
        case "esnext":
            return _val;
        default:
            return "es2015";
    }
};

const transpile = async (options: Options): Promise<void> => {
    const { config, inPath, outPath }: Options = options;

    const packageJson: PackageJson | null = await packageJsonLoader();
    const tsconfigJson: TranspileOptions | null = await tsConfigLoader({
        path: path.join(root, config.tsconfig),
    });

    const isTs: boolean = endsWithList(config.index, tsExtensions);
    const compilerOptions: CompilerOptions | undefined =
        tsconfigJson?.compilerOptions;

    const target: JscTarget =
        // swc
        config.swc.jsc?.target ??
        ESTarget(
            // tsconfig.json
            (compilerOptions?.target as
                | keyof typeof ScriptTarget
                | undefined) ??
                // default
                "ESNext",
        );

    const type: ModuleType = await getModuleType({
        config,
    });

    const module = config.swc.module as NonSystemjsConfig | undefined;

    const swcOptions: SwcOptions = {
        // base
        envName: process.env.NODE_ENV,
        configFile: false,
        // override
        ...config.swc,
        // with preset
        env: config.swc.env,
        jsc: {
            target: target,
            keepClassNames: true,
            baseUrl: path.join(root),
            paths: compilerOptions?.paths ?? {},
            preserveAllComments: true,
            ...config.swc.jsc,
            experimental: {
                keepImportAttributes: true,
                emitAssertForImportAttributes: true,
                ...config.swc.jsc?.experimental,
            },
            parser: {
                ...(config.swc.jsc?.parser
                    ? config.swc.jsc?.parser
                    : isTs
                      ? {
                              syntax: "typescript",
                              tsx: true,
                              decorators: true,
                              dynamicImport: true,
                          }
                      : {
                              syntax: "ecmascript",
                              jsx: true,
                              functionBind: true,
                              decorators: true,
                              decoratorsBeforeExport: true,
                              importAssertions: true,
                          }),
            },
        },
        module: {
            ...config.swc.module,
            type: type,
            ...((type === "commonjs" ||
                type === "es6" ||
                type === "nodenext") && {
                strict:
                    // swc
                    module?.strict ??
                    // tsconfig.json
                    compilerOptions?.strict ??
                    // default
                    false,
                strictMode:
                    // swc
                    module?.strictMode ??
                    // tsconfig.json
                    compilerOptions?.alwaysStrict ??
                    // default
                    true,
                importInterop:
                    // swc
                    module?.importInterop ??
                    // tsconfig.json
                    (compilerOptions?.esModuleInterop ? "swc" : "none"),
                /**
                 * To resolve the path fully in ES modules:
                 * https://swc.rs/docs/configuration/modules#resolvefully
                 */
                resolveFully:
                    // swc
                    (config.swc.module as ExtendedModuleConfig | undefined)
                        ?.resolveFully ??
                    // package.json
                    (packageJson?.type?.toLowerCase() === "module"
                        ? true
                        : false),
            }),
        },
        // no override
        sourceMaps: isDev() ? true : config.build.sourceMap,
        inlineSourcesContent: false,
        outputPath: path.dirname(outPath), // for source map
    };

    const result: Output = await transformFile(inPath, swcOptions);

    // write file
    await fse.ensureFile(outPath);
    await fse.writeFile(
        outPath,
        result.code +
            (result.map
                ? `//# sourceMappingURL=${path.basename(outPath)}.map`
                : ""),
    );

    // write source map
    if (result.map) {
        await fse.ensureFile(outPath);
        await fse.writeFile(`${outPath}.map`, result.map.toString());
    }
};

export type { Options };
export { transpile };
