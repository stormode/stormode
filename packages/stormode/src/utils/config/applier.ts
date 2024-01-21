import type { Config, ImpartialConfig } from "../../@types/config";
import type { DevArgs, BuildArgs, PreviewArgs } from "../../@types/args";

import * as path from "node:path";

import * as fse from "fs-extra";

const cwd = process.cwd();

const configApplier = async (
    config: Config | null = null,
    mode: "dev" | "build" | "preview" | null = null,
    devArgs: DevArgs = {},
    buildArgs: BuildArgs = {},
    previewArgs: PreviewArgs = {},
): Promise<ImpartialConfig> => {
    // blank
    if (!config) {
        throw new Error("Config not found");
    }

    if (!mode) {
        throw new Error("Mode not found");
    }

    // dev
    if (mode === "dev") {
        if (devArgs.rootDir) config.rootDir = devArgs.rootDir;
        if (devArgs.outDir) config.outDir = devArgs.outDir;
        if (devArgs.index) config.index = devArgs.index;
        if (devArgs.tsconfig) config.tsconfig = devArgs.tsconfig;
    }

    // build
    if (mode === "build") {
        if (!config.build) config.build = {};
        if (buildArgs.env) process.env.NODE_ENV = buildArgs.env;
        if (buildArgs.rootDir) config.rootDir = buildArgs.rootDir;
        if (buildArgs.outDir) config.outDir = buildArgs.outDir;
        if (buildArgs.index) config.index = buildArgs.index;
        if (buildArgs.minify) config.build.minify = buildArgs.minify;
        if (buildArgs.sourcemap) config.build.sourcemap = buildArgs.sourcemap;
        if (buildArgs.tsconfig) config.build.tsconfig = buildArgs.tsconfig;
    }

    // preview
    if (mode === "preview") {
        if (previewArgs.outDir) config.outDir = previewArgs.outDir;
        if (previewArgs.index) config.index = previewArgs.index;
    }

    // check index.ts / index.js
    const indexPath = path.resolve(cwd, config.rootDir ?? "src", "index.ts");
    const indexFallback = (await fse.exists(indexPath))
        ? "index.ts"
        : "index.js";

    const res: ImpartialConfig = {
        rootDir: config?.rootDir ?? "src",
        outDir: config?.outDir ?? ".stormode",
        index: config?.index ?? indexFallback,
        tsconfig: config?.tsconfig ?? "tsconfig.json",
        server: {
            watch: config?.server?.watch ?? [],
            ignore: config?.server?.ignore ?? [],
        },
        build: {
            minify: config?.build?.minify ?? false,
            sourcemap: config?.build?.sourcemap ?? false,
            tsconfig: config?.build?.tsconfig ?? "tsconfig.json",
        },
    };

    return res;
};

export default configApplier;
