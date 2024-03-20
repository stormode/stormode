import type { CompilerOptions, ScriptTarget, ModuleKind } from "typescript";
import type { Output, JscTarget } from "@swc/core";
import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";
import * as fse from "fs-extra";
import { transformFile } from "@swc/core";

import { isDev } from "#/configs/env";
import { tsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";

type Options = {
    config: ImpartialConfig;
    compilerOptions: CompilerOptions | undefined;
    inPath: string;
    outPath: string;
};

type ModuleType = "es6" | "nodenext" | "commonjs" | "umd" | "amd" | "systemjs";

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

const moduleType = (val: keyof typeof ModuleKind | undefined): ModuleType => {
    const _val: string = (val ?? "").toLowerCase();

    switch (_val) {
        case "es2015":
        case "es2020":
        case "es2022":
        case "esnext":
            return "es6";
        case "system":
            return "systemjs";
        case "node":
        case "node16":
        case "nodenext":
            return "nodenext";
        case "commonjs":
        case "amd":
        case "umd":
            return _val;
        // "none" | undefined
        default:
            return "commonjs";
    }
};

const transpile = async (options: Options): Promise<void> => {
    const _o: Options = options;

    const _isTs: boolean = endsWithList(_o.config.index, tsExtensions);

    const _target: JscTarget = ESTarget(
        _o.compilerOptions?.target as keyof typeof ScriptTarget | undefined,
    );

    const _type: ModuleType = moduleType(
        _o.compilerOptions?.module as keyof typeof ModuleKind | undefined,
    );

    const _result: Output = await transformFile(_o.inPath, {
        envName: process.env.NODE_ENV,
        configFile: false,
        env: _o.config.swc.env,
        jsc: {
            target: _target,
            keepClassNames: true,
            baseUrl: _o.compilerOptions?.baseUrl ?? ".",
            paths: _o.compilerOptions?.paths ?? {},
            preserveAllComments: true,
            ..._o.config.swc.jsc,
            parser: {
                ...(_o.config.swc.jsc?.parser
                    ? _o.config.swc.jsc?.parser
                    : _isTs
                      ? {
                            syntax: "typescript",
                            tsx: true,
                            decorators: true,
                            dynamicImport: true,
                        }
                      : {
                            syntax: "ecmascript",
                            jsx: true,
                            decorators: true,
                        }),
            },
        },
        module: {
            ..._o.config.swc.module,
            type: _o.config.swc.module?.type ?? _type,
            strict:
                // @ts-expect-error - BaseMooduleConfig base on type parameter
                _o.config.swc.module?.strict ??
                _o.compilerOptions?.strict ??
                false,
            strictMode:
                // @ts-expect-error - BaseMooduleConfig base on type parameter
                _o.config.swc.module?.strictMode ??
                _o.compilerOptions?.alwaysStrict ??
                true,
            importInterop:
                // @ts-expect-error - BaseMooduleConfig base on type parameter
                _o.config.swc.module?.importInterop ??
                _o.compilerOptions?.esModuleInterop
                    ? "swc"
                    : "none",
        },
        sourceMaps: isDev() ? true : _o.config.build.sourceMap,
        inlineSourcesContent: false,
        outputPath: path.dirname(_o.outPath), // for source map
    });

    // write file
    await fse.ensureFile(_o.outPath);
    await fse.writeFile(
        _o.outPath,
        _result.code +
            (_result.map
                ? `//# sourceMappingURL=${path.basename(_o.outPath)}.map`
                : ""),
    );

    // write source map
    if (_result.map) {
        await fse.ensureFile(_o.outPath);
        await fse.writeFile(`${_o.outPath}.map`, _result.map.toString());
    }
};

export type { Options };
export { transpile };
