import type { Output, Options as SwcOptions } from "@swc/core";
import type { BuildArgs, DevArgs, PreviewArgs } from "#/@types/args";
import type { Config, FullConfig } from "#/@types/config";
import type { Mode } from "#/@types/mode";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import { transformFile } from "@swc/core";
import * as fse from "fs-extra";

import { cache, root } from "#/configs/env";

import { getTranspiledName } from "#/functions/getTranspiledName";

import { stormodePackageJsonLoader } from "#/utils/package/config";

type ConfigLoaderOptions = {
    mode: Mode;
    args: Partial<DevArgs | BuildArgs | PreviewArgs>;
};

type ConfigApplierOptions = {
    config: Config;
    mode: Mode;
    args: Partial<DevArgs | BuildArgs | PreviewArgs>;
};

type ConfigLoggerOptions = {
    name?: string;
};

const finder = async (options: { path: string }): Promise<string> => {
    // declarations
    const base: string = "stormode.config.";
    const extensions: string[] = ["ts", "js", "cjs"];

    for (const ext of extensions) {
        const name: string = `${base}${ext}`;
        const configPath: string = path.join(options.path, name);
        if (await fse.pathExists(configPath)) return name;
    }

    return "";
};

const applier = async (options: ConfigApplierOptions): Promise<FullConfig> => {
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
    const res: FullConfig = {
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
            tsconfig: config.build?.tsconfig ?? "tsconfig.json",
            esbuild: config.build?.esbuild ?? {},
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

const configLogger = async (options?: ConfigLoggerOptions): Promise<void> => {
    // result
    const { terminal } = await import("#/utils/terminal");
    const pkj: PackageJson | null = await stormodePackageJsonLoader();

    terminal.info(`Stormode v${pkj ? pkj.version : "0.0.0"}`);

    if (options?.name) {
        terminal.info(`Config loaded from ${options.name}`);
    } else {
        terminal.info("Config loaded as default");
    }
};

const configLoader = async (
    options: ConfigLoaderOptions,
): Promise<FullConfig> => {
    // declarations
    const configName: string = await finder({
        path: root,
    });

    const configPath: string = path.join(root, configName);

    // load default if not exist
    if (configName === "") {
        const result: FullConfig = await applier({
            config: {},
            mode: options.mode,
            args: options.args,
        });

        await configLogger();

        return result;
    }

    // declarations
    let targetPath: string = path.join(root, configName);

    // if the config is a ts file
    if (configName.endsWith(".ts")) {
        // declarations
        const targetName: string = getTranspiledName(configName);
        targetPath = path.join(cache, targetName);

        const swcOptions: SwcOptions = {
            envName: process.env.NODE_ENV,
            configFile: false,
            jsc: {
                target: "es5",
                preserveAllComments: true,
                parser: {
                    syntax: "typescript",
                },
            },
            module: {
                type: "commonjs",
                strict: true,
                strictMode: true,
            },
            sourceMaps: true,
            inlineSourcesContent: false,
            outputPath: path.dirname(targetPath),
        };

        // transpile
        const result: Output = await transformFile(configPath, swcOptions);

        // result
        await fse.writeFile(
            targetPath,
            result.code +
                (result.map
                    ? `//# sourceMappingURL=${path.basename(targetPath)}.map`
                    : ""),
        );
        result.map && (await fse.writeFile(`${targetPath}.map`, result.map));

        // check if exist
        if (!(await fse.exists(targetPath))) {
            throw new Error("Config file not found after transpilation!");
        }
    }

    // import
    // biome-ignore lint: module
    const configModule: any = await require(targetPath);
    if (!configModule)
        throw new Error(
            "Unable to import the stormode config file, Please ensure that the config file exists and is in the correct format.",
        );

    // load
    const config: Config = configModule.default ?? configModule;
    if (typeof config !== "object")
        throw new Error(
            "Unable to read stormode config file, Please make sure you have a valid config setup or the correct format.",
        );

    // apply
    const result: FullConfig = await applier({
        config: config,
        mode: options.mode,
        args: options.args,
    });

    await configLogger({ name: configName });

    // result
    return result;
};

export { configLoader };
