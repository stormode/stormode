import type { CompilerOptions } from "typescript";
import type { Mode } from "#/@types/mode";
import type { Config, ImpartialConfig } from "#/@types/config";
import type { BuildArgs, DevArgs, PreviewArgs } from "#/@types/args";
import type { packageJson } from "#/utils/package/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { cache, cwd, root } from "#/configs/env";
import { tsExtensions } from "#/configs/extension";

import { endsWithList } from "#/functions/endsWithList";
import { getTranspiledName } from "#/functions/getTranspiledName";

import { packageJsonLoader } from "#/utils/package/config";

type ConfigLoaderOptions = {
    mode: Mode;
    args: Partial<DevArgs | BuildArgs | PreviewArgs>;
};

type ConfigApplierOptions = {
    config: Config;
    mode: Mode;
    args: Partial<DevArgs | BuildArgs | PreviewArgs>;
};

const importErr: string =
    "Unable to import the stormode config file, Please ensure that the config file exists and is in the correct format.";
const readErr: string =
    "Unable to read stormode config file, Please make sure you have a valid config setup or the correct format.";

const finder = async (): Promise<string> => {
    // declarations
    const base: string = "stormode.config.";
    const extensions: string[] = ["ts", "js", "cjs"];

    for (const ext of extensions) {
        const name: string = `${base}${ext}`;
        const configPath: string = path.resolve(cwd, name);
        if (await fse.pathExists(configPath)) return name;
    }

    return "";
};

const applier = async (
    options: ConfigApplierOptions,
): Promise<ImpartialConfig> => {
    // declarations
    const { config, mode, args } = options;

    if (typeof args.withTime === "string")
        config.withTime = args.withTime === "" ? "local" : args.withTime;

    // dev
    if (mode === "dev") {
        const _args = args as Partial<DevArgs>;
        if (_args.rootDir) config.rootDir = _args.rootDir;
        if (_args.outDir) config.outDir = _args.outDir;
        if (_args.index) config.index = _args.index;
        if (_args.tsconfig) config.tsconfig = _args.tsconfig;
    }

    // build
    if (mode === "build") {
        const _args = args as Partial<BuildArgs>;
        if (!config.build) config.build = {};
        if (_args.env) process.env.NODE_ENV = _args.env;
        if (_args.rootDir) config.rootDir = _args.rootDir;
        if (_args.outDir) config.outDir = _args.outDir;
        if (_args.index) config.index = _args.index;
        if (_args.tsconfig) config.tsconfig = _args.tsconfig;
        if (_args.platform) config.build.platform = _args.platform;
        if (_args.bundle) config.build.bundle = _args.bundle;
        if (_args.minify) config.build.minify = _args.minify;
        if (_args.sourceMap) config.build.sourceMap = _args.sourceMap;
    }

    // preview
    if (mode === "preview") {
        const _args = args as Partial<PreviewArgs>;
        if (_args.outDir) config.outDir = _args.outDir;
        if (_args.index) config.index = _args.index;
    }

    // check index.ts / index.js
    const indexPath: string = path.join(
        root,
        config.rootDir ?? "src",
        "index.ts",
    );
    const indexFallback: "index.ts" | "index.js" = (await fse.exists(indexPath))
        ? "index.ts"
        : "index.js";

    // result
    const res: ImpartialConfig = {
        withTime: config.withTime ?? false,
        rootDir: config.rootDir ?? "src",
        outDir: config.outDir ?? "dist",
        index: config.index ?? indexFallback,
        tsconfig: config.tsconfig ?? "tsconfig.json",
        swc: config.swc ?? {},
        server: {
            watch: config.server?.watch ?? [],
            ignore: config.server?.ignore ?? [],
        },
        build: {
            platform: config.build?.platform ?? "node",
            bundle: config.build?.bundle ?? false,
            minify: config.build?.minify ?? false,
            sourcemap: config.build?.sourceMap ?? false,
            sourceMap: config.build?.sourceMap ?? false,
            /** @deprecated */
            tsconfig: config.build?.tsconfig ?? "tsconfig.json",
        },
    };

    // set env
    process.env.STORMODE_TIME =
        typeof res.withTime === "boolean"
            ? res.withTime
                ? "1"
                : "0"
            : res.withTime;

    return res;
};

const configLoader = async (
    options: ConfigLoaderOptions,
): Promise<ImpartialConfig> => {
    // declarations
    const configName: string = await finder();

    // load default if not exist
    if (configName === "") {
        const result: ImpartialConfig = await applier({
            config: {},
            mode: options.mode,
            args: options.args,
        });

        return result;
    }

    // declarations
    const sourcePath: string = path.join(root, configName);
    let targetPath: string = path.join(root, configName);

    // if the config is a ts file
    if (endsWithList(configName, tsExtensions)) {
        const targetName: string = getTranspiledName(configName);
        targetPath = path.join(cache, targetName);

        let typescript: typeof import("typescript") | undefined;

        try {
            typescript = await import("typescript");
        } catch (e: unknown) {
            throw new Error("TypeScript dependency not found!");
        }

        // typescript config
        const compilerOptions: CompilerOptions = {
            target: typescript.ScriptTarget.ES5,
            module: typescript.ModuleKind.CommonJS,
            sourceMap: false,
            inlineSourceMap: true,
            inlineSources: false,
        };

        // transpile
        const transpiled: string = typescript.transpile(
            await fse.readFile(sourcePath, "utf-8"),
            compilerOptions,
            sourcePath,
        );

        // result
        await fse.writeFile(targetPath, transpiled);

        // check if exist
        if (!(await fse.exists(targetPath))) {
            throw new Error("Config file not found after transpilation!");
        }
    }

    // import
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires
    const configModule: any = await require(targetPath);
    if (!configModule) throw new Error(importErr);

    // load
    const config: Config = configModule.default ?? configModule;
    if (typeof config !== "object") throw new Error(readErr);

    // apply
    const result: ImpartialConfig = await applier({
        config: config,
        mode: options.mode,
        args: options.args,
    });

    // result
    const { terminal } = await import("#/utils/terminal");
    const pkj: packageJson | null = await packageJsonLoader();

    terminal.info(`Stormode v${pkj ? pkj.version : "0.0.0"}`);
    terminal.info(`Config loaded from ${configName}`);

    return result;
};

export { configLoader };
